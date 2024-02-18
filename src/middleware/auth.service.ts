import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { jwtDecode } from 'jwt-decode';
import * as jwt from 'jsonwebtoken';
import { isValidObjectId } from 'mongoose';


@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  private readonly secretKey = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6'; 

  use(req: Request, res: Response, next: NextFunction) {
    if (req.headers.authorization) {
      try {
        const req_header_token = req.headers.authorization;
        const decoded: any = jwtDecode(req_header_token);
        if (new Date(decoded.exp * 1000) > new Date()) {
          // Verify the token using the secret key
          jwt.verify(req_header_token.split(" ")[1], this.secretKey, (err, decodedToken) => {
            if (err) {
              throw new HttpException('Invalid Token', 401);
            } else {
              req['decodedToken'] = decodedToken;
              next();
            }
          });
        } else {
          throw new HttpException('Unauthorized Token', 401);
        }
      } catch (err) {
        throw new HttpException(err, 401);
      }
    } else {
      throw new HttpException('Invalid User/Token', 400);
    }
  }
}

export class AuthorizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const decodedToken = req['decodedToken'];
    const id=req.params.id
    if (!isValidObjectId(id)) {
      throw new HttpException('Not a valid user id', HttpStatus.BAD_REQUEST);
    }
    if (id.toString() !== decodedToken.id.toString()) {
      throw new HttpException('Unauthorized access', HttpStatus.FORBIDDEN);
    }
    next();
  }
}



