import { Request, Response } from "express";

export function VerifyLogin(type: string, req: Request): any {
  type = type.toLowerCase();
  switch (type) {
    case "user": if (req.session!.login) return true; else return false; break;
    case "admin": if (req.session!.adminlogin) return true; else return false; break;
    default: return new Error("Login type does not exists, it must be: \"user\" or \"admin\".");
  }
}

export function LogOut(req: Request, res: Response) {
  req.session!.login = undefined;
  Redirect("/", res);
}

export function Redirect(page: string, res: Response): void {
  res.redirect(page);
}
