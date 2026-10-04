const express = require("express");
const supabase = require("../services/supabase");

const router = express.Router();

/** Shape a user object for API responses (metadata → flat fields). */
function shapeUser(user) {
    if (!user) return null;
    return {
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name ?? null,
        organization: user.user_metadata?.organization ?? null,
        role: user.user_metadata?.role ?? null,
        createdAt: user.created_at ?? null,
    };
}

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

        // session === null means the project requires email confirmation.
        if (!data.session) {
            return res.status(200).json({
                success: true,
                message:
                    "Account created. Check your inbox for a confirmation link before logging in.",
                user: data.user
                    ? { id: data.user.id, email: data.user.email }
                    : null,
                requiresEmailConfirmation: true,
            });
        }

        res.json({
            success: true,
            message: "Account created.",
            user: shapeUser(data.user),
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
            // Surface Supabase's real reason (unconfirmed email, rate
            // limit, etc.) — only bad credentials get the generic text.
            const generic =
                error.code === "invalid_credentials" ||
                /invalid login credentials/i.test(error.message || "");
            return res.status(401).json({
                success: false,
                message: generic
                    ? "Invalid email or password."
                    : error.message,
            });
        }

        res.json({
            success: true,
            user: shapeUser(data.user),
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

// POST /api/auth/change-email — requires the caller's access token
// (Authorization: Bearer) plus their current password.
router.post("/change-email", async (req, res) => {
    try {
        const token = String(req.headers.authorization || "")
            .replace(/^Bearer\s+/i, "")
            .trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Missing access token.",
            });
        }

        const { newEmail, currentPassword } = req.body || {};
        if (!newEmail || !currentPassword) {
            return res.status(400).json({
                success: false,
                message: "New email and current password are required.",
            });
        }

        // 1. Identify the caller from their access token.
        const { data: userData, error: userError } =
            await supabase.auth.getUser(token);
        if (userError || !userData?.user) {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please sign in again.",
            });
        }

        // 2. Re-verify the current password before touching the account.
        const { error: passwordError } = await supabase.auth.signInWithPassword({
            email: userData.user.email,
            password: String(currentPassword),
        });
        if (passwordError) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect.",
            });
        }

        // 3. Apply the change (confirmed immediately for the demo flow).
        const { data: updated, error: updateError } =
            await supabase.auth.admin.updateUserById(userData.user.id, {
                email: String(newEmail).trim().toLowerCase(),
                email_confirm: true,
            });

        if (updateError) {
            const conflict = /already|registered|exists/i.test(
                updateError.message || ""
            );
            return res.status(conflict ? 409 : 400).json({
                success: false,
                message: conflict
                    ? "That email is already in use."
                    : updateError.message,
            });
        }

        res.json({
            success: true,
            message: "Email updated. Use the new email next time you sign in.",
            user: shapeUser(updated.user),
        });
    } catch (err) {
        console.error("Change-email error:", err.message);
        res.status(500).json({
            success: false,
            message: "Email change failed. Please try again.",
        });
    }
});

// POST /api/auth/change-password — requires the caller's access token
// (Authorization: Bearer) plus their current password.
router.post("/change-password", async (req, res) => {
    try {
        const token = String(req.headers.authorization || "")
            .replace(/^Bearer\s+/i, "")
            .trim();

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Missing access token.",
            });
        }

        const { currentPassword, newPassword } = req.body || {};
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current and new password are required.",
            });
        }

        if (String(newPassword).length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters.",
            });
        }

        // 1. Identify the caller from their access token.
        const { data: userData, error: userError } =
            await supabase.auth.getUser(token);
        if (userError || !userData?.user) {
            return res.status(401).json({
                success: false,
                message: "Session expired. Please sign in again.",
            });
        }

        // 2. Re-verify the current password before touching the account.
        const { error: passwordError } = await supabase.auth.signInWithPassword({
            email: userData.user.email,
            password: String(currentPassword),
        });
        if (passwordError) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect.",
            });
        }

        // 3. Apply the change. admin.updateUserById does NOT invalidate
        //    the caller's session, so the demo flow stays signed in.
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            userData.user.id,
            { password: String(newPassword) }
        );

        if (updateError) {
            return res.status(400).json({
                success: false,
                message: updateError.message,
            });
        }

        res.json({
            success: true,
            message: "Password updated. Use it the next time you sign in.",
        });
    } catch (err) {
        console.error("Change-password error:", err.message);
        res.status(500).json({
            success: false,
            message: "Password change failed. Please try again.",
        });
    }
});

module.exports = router;
