import { 
  User, InsertUser, 
  ProductOrService, InsertProductOrService,
  Sale, InsertSale,
  IncomeStatement, InsertIncomeStatement,
  ClientQuery, InsertClientQuery,
  users, productsAndServices, sales, incomeStatements, clientQueries
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db, pool } from "./db";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Products and services methods
  getProductOrService(id: number): Promise<ProductOrService | undefined>;
  getAllProductsAndServices(): Promise<ProductOrService[]>;
  createProductOrService(product: InsertProductOrService): Promise<ProductOrService>;
  
  // Sales methods
  getSale(id: number): Promise<Sale | undefined>;
  getAllSales(): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  
  // Income statement methods
  getIncomeStatement(id: number): Promise<IncomeStatement | undefined>;
  getAllIncomeStatements(): Promise<IncomeStatement[]>;
  createIncomeStatement(statement: InsertIncomeStatement): Promise<IncomeStatement>;
  
  // Client query methods
  getClientQuery(id: number): Promise<ClientQuery | undefined>;
  getAllClientQueries(): Promise<ClientQuery[]>;
  createClientQuery(query: Omit<ClientQuery, "id" | "createdAt" | "updatedAt">): Promise<ClientQuery>;
  updateClientQuery(id: number, updates: Partial<Omit<ClientQuery, "id" | "createdAt" | "updatedAt">>): Promise<ClientQuery>;
  
  // Session store
  sessionStore: any; // Using any type to avoid SessionStore type issues
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, ProductOrService>;
  private sales: Map<number, Sale>;
  private incomeStatements: Map<number, IncomeStatement>;
  private clientQueries: Map<number, ClientQuery>;
  
  private currentUserId: number;
  private currentProductId: number;
  private currentSaleId: number;
  private currentIncomeStatementId: number;
  private currentClientQueryId: number;
  
  sessionStore: any; // Using any type to avoid SessionStore type issues

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.sales = new Map();
    this.incomeStatements = new Map();
    this.clientQueries = new Map();
    
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentSaleId = 1;
    this.currentIncomeStatementId = 1;
    this.currentClientQueryId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...userData, 
      id,
      createdAt: now 
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Products and services methods
  async getProductOrService(id: number): Promise<ProductOrService | undefined> {
    return this.products.get(id);
  }

  async getAllProductsAndServices(): Promise<ProductOrService[]> {
    return Array.from(this.products.values());
  }

  async createProductOrService(productData: InsertProductOrService): Promise<ProductOrService> {
    const id = this.currentProductId++;
    const now = new Date();
    const product: ProductOrService = {
      ...productData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.products.set(id, product);
    return product;
  }

  // Sales methods
  async getSale(id: number): Promise<Sale | undefined> {
    return this.sales.get(id);
  }

  async getAllSales(): Promise<Sale[]> {
    return Array.from(this.sales.values());
  }

  async createSale(saleData: InsertSale): Promise<Sale> {
    const id = this.currentSaleId++;
    const now = new Date();
    const sale: Sale = {
      ...saleData,
      id,
      date: now
    };
    this.sales.set(id, sale);
    return sale;
  }

  // Income statement methods
  async getIncomeStatement(id: number): Promise<IncomeStatement | undefined> {
    return this.incomeStatements.get(id);
  }

  async getAllIncomeStatements(): Promise<IncomeStatement[]> {
    return Array.from(this.incomeStatements.values());
  }

  async createIncomeStatement(statementData: InsertIncomeStatement): Promise<IncomeStatement> {
    const id = this.currentIncomeStatementId++;
    const now = new Date();
    const statement: IncomeStatement = {
      ...statementData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.incomeStatements.set(id, statement);
    return statement;
  }

  // Client query methods
  async getClientQuery(id: number): Promise<ClientQuery | undefined> {
    return this.clientQueries.get(id);
  }

  async getAllClientQueries(): Promise<ClientQuery[]> {
    return Array.from(this.clientQueries.values());
  }

  async createClientQuery(queryData: Omit<ClientQuery, "id" | "createdAt" | "updatedAt">): Promise<ClientQuery> {
    const id = this.currentClientQueryId++;
    const now = new Date();
    const query: ClientQuery = {
      ...queryData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.clientQueries.set(id, query);
    return query;
  }

  async updateClientQuery(id: number, updates: Partial<Omit<ClientQuery, "id" | "createdAt" | "updatedAt">>): Promise<ClientQuery> {
    const query = await this.getClientQuery(id);
    if (!query) {
      throw new Error("Query not found");
    }
    
    const now = new Date();
    const updatedQuery: ClientQuery = {
      ...query,
      ...updates,
      updatedAt: now
    };
    this.clientQueries.set(id, updatedQuery);
    return updatedQuery;
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;  // Using any to bypass type checking issue

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Products and services methods
  async getProductOrService(id: number): Promise<ProductOrService | undefined> {
    const [product] = await db.select().from(productsAndServices).where(eq(productsAndServices.id, id));
    return product;
  }

  async getAllProductsAndServices(): Promise<ProductOrService[]> {
    return await db.select().from(productsAndServices);
  }

  async createProductOrService(productData: InsertProductOrService): Promise<ProductOrService> {
    const [product] = await db.insert(productsAndServices).values(productData).returning();
    return product;
  }

  // Sales methods
  async getSale(id: number): Promise<Sale | undefined> {
    const [sale] = await db.select().from(sales).where(eq(sales.id, id));
    return sale;
  }

  async getAllSales(): Promise<Sale[]> {
    return await db.select().from(sales);
  }

  async createSale(saleData: InsertSale): Promise<Sale> {
    const [sale] = await db.insert(sales).values(saleData).returning();
    return sale;
  }

  // Income statement methods
  async getIncomeStatement(id: number): Promise<IncomeStatement | undefined> {
    const [statement] = await db.select().from(incomeStatements).where(eq(incomeStatements.id, id));
    return statement;
  }

  async getAllIncomeStatements(): Promise<IncomeStatement[]> {
    return await db.select().from(incomeStatements);
  }

  async createIncomeStatement(statementData: InsertIncomeStatement): Promise<IncomeStatement> {
    const [statement] = await db.insert(incomeStatements).values(statementData).returning();
    return statement;
  }

  // Client query methods
  async getClientQuery(id: number): Promise<ClientQuery | undefined> {
    const [query] = await db.select().from(clientQueries).where(eq(clientQueries.id, id));
    return query;
  }

  async getAllClientQueries(): Promise<ClientQuery[]> {
    return await db.select().from(clientQueries);
  }

  async createClientQuery(queryData: Omit<ClientQuery, "id" | "createdAt" | "updatedAt">): Promise<ClientQuery> {
    const [query] = await db.insert(clientQueries).values(queryData).returning();
    return query;
  }

  async updateClientQuery(id: number, updates: Partial<Omit<ClientQuery, "id" | "createdAt" | "updatedAt">>): Promise<ClientQuery> {
    const [updatedQuery] = await db.update(clientQueries)
      .set({...updates, updatedAt: new Date()})
      .where(eq(clientQueries.id, id))
      .returning();
    
    if (!updatedQuery) {
      throw new Error("Query not found");
    }
    
    return updatedQuery;
  }
}

// Switch to use the database storage
export const storage = new DatabaseStorage();
