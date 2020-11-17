// import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw Error('Valor maior que o total');
    }

    let categoriaAchou = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!categoriaAchou) {
      categoriaAchou = categoryRepository.create({
        title: category,
      });
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: categoriaAchou,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
