import mongoose from 'mongoose';
import Model from '../../models/CategoriesModel.js';
import ProductsModel from '../../models/ProductsModel.js';
import { LogUtils } from '../../utils/LogUtils.js';

/**
 * Interface
 * title: 'title of category' (required)
 */

class CategoriesController {

  async getCategoriesWithProducts(companyId){
    const result = await Model.aggregate([
      { $match: { company: mongoose.Types.ObjectId(companyId) } },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products',
        },
      },
      { $sort: { displayPosition: 1 } },
    ]);

    return result;
  }

  async getAll(req, res) {
    try {
      const company = req.headers.companyid;
      const categories = await Model.find({ company });

      return res.status(200).json(categories);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Falha na requisição, tente novamente mais tarde',
      });
    }
  }

  listCategoriesWithProducts = async(req, res) => {
    try {
      const company = req.headers.companyid;
      const categories = await this.getCategoriesWithProducts(company)
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Falha na requisição, tente novamente mais tarde',
      });
    }
  }

  async get(req, res) {
    try {
      const id = req.params?.categoryId;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'É preciso informar o id da categoria',
        });
      }

      const category = await Model.findById(id);

      return res.status(200).json(category);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Falha na requisição, tente novamente mais tarde',
      });
    }
  }

  async create(req, res) {
    try {
      const company = req.headers.companyid;
      const { title } = req.body;

      if (!title.trim().length) {
        res.status(200).json({
          success: false,
          message: 'O título não pode ficar em branco',
        });
        return;
      }

      const category = await Model.create({
        company,
        title: title.trim(),
        isActive: true,
      });

      res.status(200).json(category);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Falha na requisição, tente novamente mais tarde',
      });
    }
  }

  async updateName(req, res) {
    try {
      const { categoryId } = req.params;
      const { title } = req.body;

      if (!title || title.trim() === '') {
        return res
          .status(400)
          .json({ success: false, message: 'O nome da categoria vazio' });
      }

      const category = await Model.findByIdAndUpdate(
        categoryId,
        { $set: { title } },
        { new: true }
      );

      res.status(200).json(category);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Não foi possível editar a categoria',
      });
    }
  }

  update = async (req, res) => {
    try {
      const company = req.headers.companyid;
      const data = req.body;

      for (const c of data) {
        await Model.updateOne(
          { _id: c._id },
          { $set: { displayPosition: c.displayPosition, isActive: c.isActive } }
        );

        for (const p of c.products) {
          await ProductsModel.updateOne(
            { _id: p._id },
            { $set: { displayPosition: p.displayPosition, isActive: p.isActive } }
          );
        }
      }

      const categories = await this.getCategoriesWithProducts(company)

      res.status(200).json(categories);
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(400).json({
        success: false,
        message: 'Não foi possível editar a categoria',
      });
    }
  }

  async delete(req, res) {
    try {
      const company = req.headers.companyid;
      const { categoryId } = req.params;

      const hasProductsInCategory = await ProductsModel.findOne({ category: categoryId });

      if (hasProductsInCategory?._id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Não foi possível excluir a categoria, pois ainda existem produtos vinculados a ela.'
        });
      };

      await Model.deleteOne({ _id: categoryId, company });
      const categories = await Model.aggregate([
        { $match: { company: mongoose.Types.ObjectId(company) } },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'category',
            as: 'products',
          },
        },
      ]);
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Ocorreu um erro ao excluir a categoria',
      });
    }
  }
}

export default CategoriesController;
