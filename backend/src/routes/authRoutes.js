const express = require("express");
const supabase = require("../services/supabase");

const router = express.Router();

// POST /api/auth/signup — creates a real user via Supabase Auth.
// Profile fields ride along in user_metadata (no custom tables needed).
router.post("/signup", async (req, res) => {
    try {
        const { name, fullName, email, organization, role, password } =
            req.body || {};
        const displayName = String(name || fullName || "").trim();

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        if (String(password).length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters.",
            });
        }

        const { data, error } = await supabase.auth.signUp({
            email: String(email).trim().toLowerCase(),
            password: String(password),
            options: {
                data: {
                    full_name: displayName,
                    organization: String(organization || "").trim(),
                    role: String(role || "Other").trim(),
                },
            },
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        res.json({
            success: true,
            message: "Account created.",
            user: data.user
                ? { id: data.user.id, email: data.user.email }
                : null,
        });
    } catch (err) {
        console.error("Signup error:", err.message);
        res.status(500).json({
            success: false,
            message: "Signup failed. Please try again.",
        });
    }
});

// POST /api/auth/login — verifies credentials, returns the session.
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: String(email).trim().toLowerCase(),
            password: String(password),
        });

        if (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        res.json({
            success: true,
            user: {
                id: data.user.id,
                email: data.user.email,
                fullName: data.user.user_metadata?.full_name ?? null,
            },
            session: {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                expiresAt: data.session.expires_at,
            },
        });
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).json({
            success: false,
            message: "Login failed. Please try again.",
        });
    }
});

module.exports = router;
