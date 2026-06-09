import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { regdid, password } = req.body;
    if (!regdid || !password) {
      return res.status(400).json({ error: 'Registration ID and password are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, regdid, password_hash, name, role, branch, profile_photo, clubmail, originalmail, skills')
      .eq('regdid', regdid)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        regdid: user.regdid,
        name: user.name,
        role: user.role,
        branch: user.branch,
        profile_photo: user.profile_photo,
        clubmail: user.clubmail,
        originalmail: user.originalmail,
        skills: user.skills,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, regdid, name, role, branch, profile_photo, clubmail, originalmail, skills')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
