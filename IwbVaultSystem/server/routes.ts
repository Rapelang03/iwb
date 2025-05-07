import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { NLPManager } from "./nlp";
import { createBackup, restoreFromBackup, getAvailableBackups, scheduleBackups } from "./backup";
import { insertProductSchema, insertSaleSchema, insertIncomeStatementSchema, insertClientQuerySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Initialize NLP manager for query responses
  const nlpManager = new NLPManager();
  await nlpManager.initialize();

  // API routes for products and services
  app.get("/api/products", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = req.user!;
      // Check if user has the right to access products
      if (!["sales", "developer", "iwc_partner"].includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const products = await storage.getAllProductsAndServices();
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/products", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = req.user!;
      // Check if user has the right to add products
      if (!["sales", "developer"].includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validatedData = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProductOrService(validatedData);
      res.status(201).json(newProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      next(error);
    }
  });

  // API routes for sales
  app.get("/api/sales", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = req.user!;
      // Check if user has the right to view sales
      if (!["sales", "finance", "developer", "iwc_partner"].includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const sales = await storage.getAllSales();
      res.json(sales);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/sales", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = req.user!;
      // Check if user has the right to add sales
      if (!["sales", "developer"].includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validatedData = insertSaleSchema.parse({
        ...req.body,
        createdBy: user.id
      });
      const newSale = await storage.createSale(validatedData);
      res.status(201).json(newSale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sale data", errors: error.errors });
      }
      next(error);
    }
  });

  // API routes for income statements
  app.get("/api/income", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = req.user!;
      // Check if user has the right to view income statements
      if (!["finance", "developer", "investor", "iwc_partner"].includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const statements = await storage.getAllIncomeStatements();
      res.json(statements);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/income", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = req.user!;
      // Check if user has the right to add income statements
      if (!["finance", "developer"].includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const validatedData = insertIncomeStatementSchema.parse({
        ...req.body,
        createdBy: user.id
      });
      const newStatement = await storage.createIncomeStatement(validatedData);
      res.status(201).json(newStatement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid income statement data", errors: error.errors });
      }
      next(error);
    }
  });

  // API routes for client queries
  app.get("/api/queries", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = req.user!;
      // Check if user has the right to view queries
      if (!["sales", "developer"].includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const queries = await storage.getAllClientQueries();
      res.json(queries);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/queries", async (req, res, next) => {
    try {
      // Client queries can be submitted without authentication
      const validatedData = insertClientQuerySchema.parse(req.body);
      
      // Check if we can generate an automatic response
      const autoResponse = await nlpManager.generateResponse(validatedData.message);
      
      let newQuery;
      if (autoResponse) {
        // Auto-respond to the query
        newQuery = await storage.createClientQuery({
          ...validatedData,
          response: autoResponse,
          respondedBy: null, // No human respondent for auto-complete
          status: "auto_complete"
        });
      } else {
        // No auto-response, set as pending
        newQuery = await storage.createClientQuery({
          ...validatedData,
          response: null,
          respondedBy: null,
          status: "pending"
        });
      }
      
      res.status(201).json(newQuery);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid query data", errors: error.errors });
      }
      next(error);
    }
  });

  app.post("/api/queries/:id/respond", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = req.user!;
      // Check if user has the right to respond to queries
      if (!["sales", "developer"].includes(user.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const { id } = req.params;
      const { response } = req.body;
      
      if (!response || typeof response !== "string") {
        return res.status(400).json({ message: "Response is required" });
      }
      
      const query = await storage.getClientQuery(parseInt(id));
      if (!query) {
        return res.status(404).json({ message: "Query not found" });
      }
      
      const updatedQuery = await storage.updateClientQuery(parseInt(id), {
        response,
        status: "complete",
        respondedBy: user.id
      });
      
      res.json(updatedQuery);
    } catch (error) {
      next(error);
    }
  });

  // API route for user management (developer only)
  app.get("/api/users", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = req.user!;
      // Check if user is a developer
      if (user.role !== "developer") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const users = await storage.getAllUsers();
      // Remove sensitive data
      const sanitizedUsers = users.map(user => {
        const { password, ...userWithoutSensitiveData } = user;
        return userWithoutSensitiveData;
      });
      
      res.json(sanitizedUsers);
    } catch (error) {
      next(error);
    }
  });

  // Backup and restore routes (developer only)
  app.post("/api/backup", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = req.user!;
      // Check if user is a developer
      if (user.role !== "developer") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const backupPath = await createBackup();
      res.json({
        message: "Backup created successfully",
        backupPath: path.basename(backupPath)
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/backups", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = req.user!;
      // Check if user is a developer
      if (user.role !== "developer") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const backups = getAvailableBackups();
      res.json(backups);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/restore", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = req.user!;
      // Check if user is a developer
      if (user.role !== "developer") {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const { backupFile } = req.body;
      if (!backupFile) {
        return res.status(400).json({ message: "Backup file name is required" });
      }
      
      const backupPath = path.join(process.cwd(), 'backups', backupFile);
      await restoreFromBackup(backupPath);
      
      res.json({ message: "Restored from backup successfully" });
    } catch (error) {
      next(error);
    }
  });

  // Schedule automatic backups
  scheduleBackups(24); // Backup every 24 hours

  const httpServer = createServer(app);
  return httpServer;
}
