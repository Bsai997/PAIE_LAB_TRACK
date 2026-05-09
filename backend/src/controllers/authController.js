import supabase from '../utils/supabase.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const login = async (req, res) => {
  try {
    const { regdid, password } = req.body;

    if (!regdid || !password) {
      return res.status(400).json({ message: 'RegdID and password are required' });
    }

    // Fetch user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('regdid', regdid)
      .single();

    console.log('Fetching user with regdid:', regdid);
    console.log('User found:', user);
    console.log('Error:', error);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid credential', debug: error });
    }

    // Compare password
    // console.log('Comparing passwords...');
    // console.log('Input password:', password);
    // console.log('Stored hash:', user.password_hash);
    const valid = await bcrypt.compare(password, user.password_hash);
    console.log('Password valid:', valid);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials', debug: { password, storedHash: user.password_hash } });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        regdid: user.regdid,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ 
      token, 
      role: user.role,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const register = async (req, res) => {
  try {
    const { regdid, name, email, password, role, department } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const { data, error } = await supabase
      .from('Users')
      .insert({
        regdid,
        name,
        email,
        password_hash: hashedPassword,
        role: role || 'student',
        department,
        profile_img: null
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: 'User already exists or invalid data' });
    }

    res.json({ message: 'User registered successfully', user: data });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
