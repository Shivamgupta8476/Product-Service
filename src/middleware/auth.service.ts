import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { jwtDecode } from 'jwt-decode';
import * as jwt from 'jsonwebtoken';
import { isValidObjectId } from 'mongoose';
require('dotenv').config();


@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  private readonly secretKey = process.env.SECRET_KEY; 

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
              req['user'] = decodedToken;
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
    const decodedToken = req['user'];
    if(decodedToken.role !== 'admin'){
       throw new HttpException('Unauthorized access', HttpStatus.FORBIDDEN);
    }
    next();
  }
}



