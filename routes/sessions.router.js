import { Router } from "express";
import userModel from "../dao/models/Users.model.js";
import { createHash, isValidPassword } from "../src/utils.js";
import passport from "passport";
import GitHubStrategy from "passport-github2";

const router = Router();

router.post(
  "/register",
  passport.authenticate("register", {
    failureRedirect: "/api/sessions/failregister",
  }),
  async (req, res) => {
    res.send({ status: "success", message: "User registered" });
  }
);

router.get("/failregister", (req, res) => {
  res.status(400).send({ status: "error", error: "Registry fail" });
});

router.post(
  "/login",
  passport.authenticate("login", {
    failureRedirect: "/api/sessions/faillogin",
  }),
  async (req, res) => {
    if (!req.user)
      return res
        .status(400)
        .send({ status: "error", error: "Incorrect credentials" });

    req.session.user = {
      name: `${req.user.first_name} ${req.user.last_name}`,
      email: req.user.email,
      age: req.user.age,
    };
    res.send({
      status: "success",
      payload: req.session.user,
      message: "¡Primer logueo realizado! :)",
    });
  }
);

router.get("/faillogin", (req, res) => {
  res.status(400).send({ status: "error", error: "Login fail" });
});
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error al destruir la sesión:", err);
    } else {
      res.redirect("/login");
    }
  });
});

router.put("/restartPassword", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({
      status: "error",
      error: "Incomplete Values",
    });
  }

  const user = await userModel.findOne({ email });

  if (!user)
    return res.status(404).send({ status: "error", error: "Not user found" });

  const newHashedPassword = createHash(password);

  await userModel.updateOne(
    { _id: user._id },
    { $set: { password: newHashedPassword } }
  );

  res.send({ status: "success", message: "Contraseña restaurada" });
});

//GITHUB
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);

router.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "api/sessions/login" }),
  async (req, res) => {
    req.session.user = req.user;
    res.redirect("/api/products");
  }
);

export default router;
