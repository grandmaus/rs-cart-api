import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { User } from '../models';

@Injectable()
export class UsersService {
  private readonly users: Record<string, User>;

  constructor() {
    this.users = {}
  }

  findOne(userId: string): User {
    return this.users[ userId ];
  }

  createOne({ name, password }: User): User {
    const id = v4(v4());
    const newUser = { id: name || id, name, password };

    console.log('name >>>', name);
    console.log('password >>>', password);
    console.log('this.users >>>', this.users);

    this.users[ id ] = newUser;

    return newUser;
  }

}
