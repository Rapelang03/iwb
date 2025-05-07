import { pgTable, text, serial, integer, boolean, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define a role enum for user roles
export const roleEnum = pgEnum("role", [
  "sales", 
  "finance", 
  "developer", 
  "investor", 
  "iwc_partner"
]);

// Define query status enum
export const queryStatusEnum = pgEnum("status", ["pending", "complete", "auto_complete"]);

// Define product/service category enum
export const categoryEnum = pgEnum("category", ["product", "service"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: roleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Products and services table
export const productsAndServices = pgTable("products_services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Store price in cents
  category: categoryEnum("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sales records table
export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => productsAndServices.id),
  quantity: integer("quantity").notNull(),
  totalAmount: integer("total_amount").notNull(), // Store amount in cents
  date: timestamp("date").defaultNow().notNull(),
  createdBy: integer("created_by").notNull().references(() => users.id),
});

// Monthly income statements table
export const incomeStatements = pgTable("income_statements", {
  id: serial("id").primaryKey(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  totalRevenue: integer("total_revenue").notNull(), // Store amount in cents
  totalExpenses: integer("total_expenses").notNull(), // Store amount in cents
  netProfit: integer("net_profit").notNull(), // Store amount in cents
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by").notNull().references(() => users.id),
});

// Client queries table
export const clientQueries = pgTable("client_queries", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  message: text("message").notNull(),
  response: text("response"),
  status: queryStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  respondedBy: integer("responded_by").references(() => users.id),
});

// Create Zod schemas for insertion
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(productsAndServices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
});

export const insertIncomeStatementSchema = createInsertSchema(incomeStatements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientQuerySchema = createInsertSchema(clientQueries).omit({
  id: true,
  status: true,
  response: true,
  createdAt: true,
  updatedAt: true,
  respondedBy: true,
});

// Define the types for use in the application
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ProductOrService = typeof productsAndServices.$inferSelect;
export type InsertProductOrService = z.infer<typeof insertProductSchema>;

export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;

export type IncomeStatement = typeof incomeStatements.$inferSelect;
export type InsertIncomeStatement = z.infer<typeof insertIncomeStatementSchema>;

export type ClientQuery = typeof clientQueries.$inferSelect;
export type InsertClientQuery = z.infer<typeof insertClientQuerySchema>;

// Create login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;
