import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db';
import { RegisterUserInput, LoginUserInput } from '../schemas/validationSchemas';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, role, organizationName } = req.body as RegisterUserInput;

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, role, organization_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, role, organization_name, created_at`,
      [email, passwordHash, fullName, role, organizationName || null]
    );

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, fullName: user.full_name },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    const responseUser = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      organizationName: user.organization_name,
      createdAt: user.created_at,
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: responseUser,
      data: {
        token,
        user: responseUser,
      },
    });
  } catch (error) {
    console.error('[Auth] Register error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginUserInput;

    // Find user
    const result = await query(
      'SELECT id, email, password_hash, full_name, role, organization_name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, fullName: user.full_name },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    const responseUser = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      organizationName: user.organization_name,
    };

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: responseUser,
      data: {
        token,
        user: responseUser,
      },
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // User is attached by authenticateToken middleware
    const authReq = req as Request & { user?: { userId: string } };
    const userId = authReq.user?.userId;

    const result = await query(
      'SELECT id, email, full_name, role, organization_name, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const user = result.rows[0];
    const responseUser = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      organizationName: user.organization_name,
      createdAt: user.created_at,
    };

    res.status(200).json({
      success: true,
      user: responseUser,
      data: {
        user: responseUser,
      },
    });
  } catch (error) {
    console.error('[Auth] GetMe error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
