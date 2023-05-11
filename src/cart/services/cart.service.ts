import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { Cart } from '../models';
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Carts } from "../../database/entities/carts.entity";
import { CartItems } from "../../database/entities/cart_items.entity";
import { UpdateCartDto } from "../dto/update-cart.dto";

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Carts)
    private readonly cartsRepository: Repository<Carts>,
    @InjectRepository(CartItems)
    private readonly cartItemsRepository: Repository<CartItems>,
  ) {}

  async findByUserId(userId: string): Promise<Cart> {
    const cart = await this.cartsRepository.findOne({
      relations: ['items'],
      select: ['id', 'items'],
      where: { user_id: userId },
    });
    console.log('CartService >>>>>>>>>>>', cart, userId);
    if (cart) {
      return {
        ...cart,
        items: cart?.items.map(({ productId, count }) => ({
          product: {
            id: productId,
            title: 'Product title',
            description: 'Product description',
            price: 10,
          },
          count,
        })),
      };
    }
  }

  async createByUserId(userId: string): Promise<Cart> {
    const id = v4(v4());
    const userCart = {
      id,
      items: [],
    };

    await this.cartsRepository.insert({ ...userCart, user_id: userId });

    return userCart;
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return await this.createByUserId(userId);
  }

  async updateByUserId(userId: string, updateCartDto: UpdateCartDto): Promise<Cart> {
    const { id } = await this.findOrCreateByUserId(userId);
    const isExist = await this.cartItemsRepository.exist({
      where: {
        productId: updateCartDto.productId,
      },
    });

    if (isExist) {
      await this.cartItemsRepository.update(
        { productId: updateCartDto.productId },
        { cartId: id, ...updateCartDto },
      );
    } else {
      await this.cartItemsRepository.insert({ cartId: id, ...updateCartDto });
    }

    return await this.findByUserId(userId);
  }

  async removeByUserId(userId): Promise<void> {
    const cart = await this.findByUserId(userId);
    if (cart) {
      this.cartsRepository.delete({ id: cart.id });
    }
  }
}
