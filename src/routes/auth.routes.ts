import { Router } from "express";
import { signIn, signOut, signUp } from "#controllers/auth.controller";
import { arcjetSignupGuard } from "#middleware/arcjet.middleware";

const authRouter = Router();

authRouter.post("/signup", arcjetSignupGuard, signUp);
authRouter.post("/signin", arcjetSignupGuard, signIn);
authRouter.post("/signout", signOut);

export default authRouter;
