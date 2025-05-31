
import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest"; // <-- Import supertest

// Mock dependencies
jest.mock("@prisma/client");
jest.mock("../../src/utils/validation");
jest.mock("../../src/utils/jwtUtils");
jest.mock("../../src/utils/erroHandler");
jest.mock("jsonwebtoken");

import { createUser, loginUser, logoutUser } from "../../src/controller/authController";

const app = express();
app.use(express.json());
app.use(cookieParser());

// Register routes for testing
app.post("/api/auth/register", createUser);
app.post("/api/auth", loginUser);
app.post("/api/auth/logout", logoutUser);

// Declare mocks at top-level so all tests can use them
let mockPrisma: any;
let mockValidation: any;
let mockJwtUtils: any;
let mockJwt: any;

beforeEach(() => {
    jest.clearAllMocks();

    // Mock Prisma client methods
    mockPrisma = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn()
        },
        refreshToken: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn()
        }
    };

    // Replace PrismaClient with our mock
    const { PrismaClient } = require("@prisma/client");
    PrismaClient.mockImplementation(() => mockPrisma);

    // Mock validation utility
    mockValidation = require("../../src/utils/validation");
    mockValidation.default = jest.fn();

    // Mock JWT utilities
    mockJwtUtils = require("../../src/utils/jwtUtils");
    mockJwtUtils.hashPassword = jest.fn();
    mockJwtUtils.verifyPassword = jest.fn();

    // Mock jsonwebtoken
    mockJwt = require('jsonwebtoken');
    mockJwt.default = { sign: jest.fn() };
    mockJwt.sign = jest.fn();
});

describe('POST /api/auth/register', () => {
    const validUserData = {
        name: "chaman chutiya",
        email: "chaman@gmail.com",
        password: "password123"
    };

    it("should create a user successfully", async () => {
        // Arrange: Set up all mocks to simulate a successful registration
        mockValidation.default.mockReturnValue(validUserData); // Validation passes
        mockPrisma.user.findUnique.mockResolvedValue(null); // No user exists with this email
        mockJwtUtils.hashPassword.mockResolvedValue("hashedPassword123"); // Password is hashed
        mockPrisma.user.create.mockResolvedValue({
            id: 1,
            ...validUserData,
            password: "hashedPassword123"
        });

        // Act: Make the request
        const response = await request(app).post("/api/auth/register").send(validUserData);

        // Assert: Check the response
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            message: "account created successfully",
            id: 1
        });

        // Assert: Ensure mocks were called as expected
        expect(mockValidation.default).toHaveBeenCalledWith(expect.anything(), validUserData);
        expect(mockPrisma.user.findUnique).toHaveBeenCalled();
        expect(mockJwtUtils.hashPassword).toHaveBeenCalledWith(validUserData.password);
        expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    // Add more tests for error cases, e.g. user already exists, validation fails, etc.
});