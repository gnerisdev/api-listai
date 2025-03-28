import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { upload } from '../../settings/multer.js';
import { LogUtils } from '../../utils/LogUtils.js';
import Model from '../../models/ProductsModel.js';
import ComplementsController from './ComplementsController.js';

class ProductController {
  async getAll(req, res) {
    const company = req.headers.companyid;
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;
    const searchTerm = req.query.search || '';
    const filterStatus = req.query.status || '';
    const filterCategory = req.query.filterCategory || '';
  
    try {
      const filter = { company };
  
      if (searchTerm) {
        filter.$or = [{ name: { $regex: searchTerm, $options: 'i' } }];
      }
  
      if (filterStatus) filter.isActive = JSON.parse(filterStatus);
  
      if (filterCategory) filter.category = filterCategory;
  
      const totalProducts = await Model.countDocuments(filter);
      const totalPages = Math.ceil(totalProducts / perPage);
  
      const products = await Model.find(filter)
        .populate('category', 'title')
        .populate({ path: 'complements' })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();
  
      return res.status(200).json({ products, totalPages, page });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao obter os produtos.' });
    }
  }
  
  async getProduct(req, res) {
    try {
      const company = req.headers.companyid;
      const { id } = req.params;

      const product = await Model.findById(id)
        .populate({ path: 'complements' })
        .populate({ path: 'category', select: 'title' });

      return res.status(200).json(product);
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(500).json({ error: 'Erro ao obter os produtos.' });
    }
  }

  async create(req, res) {
    let productCreate = null;

    upload.array('images')(req, res, async (err) => {
      try {
        const company = req.headers.companyid;
        let {
          name,
          description,
          code,
          price,
          unit,
          discountPrice,
          isActive,
          category,
          complements 
        } = req.body;
        const images = [];

        if (!name.trim().length) {
          return res.status(400).json({
            success: false,
            message: 'Nome não pode ficar em branco'
          });
        }

        if (isNaN(price)) {
          return res.status(400).json({ success: false, message: 'Preço inválido' });
        }

        if (typeof (Number(price)) !== 'number') {
          return res.status(400).json({ success: false, message: 'Preço inválido' });
        }

        if (req.files.length <= 0) {
          return res.status(400).json({ success: false, message: 'É preciso enviar a foto do ptoduto' });
        }

        if (req.files.length) {
          const uploadPromises = req.files.map(file => {
            return new Promise((resolve, reject) => {
              cloudinary.uploader.upload(file.path, { folder: company }, (error, result) => {
                error ? reject(error) : resolve(result);
              });
            });
          });

          
          const uploads = await Promise.all(uploadPromises);
          
          uploads.map(upload => images.push({ id: upload.public_id, url: upload.url }));
          
          req.files.map(file => fs.unlink(file.path, (err) => { }));
        }
        
        if (!category) {
          return res.status(400).json({ 
            success: false, 
            message: 'É preciso selecionar a categoria' 
          });
        }

        const productLast = await Model.findOne({ category })
          .sort({ displayPosition: -1 })
          .exec();

        productCreate = await Model.create({
          isActive: isActive || true,
          description: description || '',
          code: code || '',
          company,
          name,
          unit,
          category,
          images,
          discountPrice,
          displayPosition: (productLast?.displayPosition + 1 || 1),
          price: Number(price),
        });

        if (complements?.length > 0) {
          const complementAdd = await new ComplementsController()
            .createComplement(JSON.parse(complements), company);
          await Model.findByIdAndUpdate(productCreate._id, { complements: complementAdd });
        }

        res.status(200).json({ success: true, message: 'Produto criado!' });
      } catch (error) {
        if (productCreate) {
          await Model.findByIdAndDelete(productCreate._id);

          return res.status(400).json({ 
            success: false, 
            message: 'Não foi possível criar os complementos do produto' 
          });
        }
        return res.status(400).json({ success: false, message: 'Erro ao tentar criar o produto' });
      }
    });
  }

  async update(req, res) {
    const updateData = {};

    upload.array('images')(req, res, async (err) => {
      try {
        const { productId } = req.params;
        const company = req.headers.companyid;
        const data = req.body;

        if (!data.name.trim().length) {
          return res.status(400).json({
            success: false, message: 'Nome não pode ficar em branco'
          });
        }

        if (Number(data.price) == NaN) {
          return res.status(400).json({
            success: false, message: 'Preço inválido'
          });
        }

        if (typeof (Number(data.price)) !== 'number') {
          return res.status(400).json({
            success: false, message: 'Preço inválido'
          });
        }
        
        if (data.images?.length <= 0 && req.files.length <= 0) {
          return res.status(400).json({
            success: false, 
            message: 'É preciso enviar a foto do produto'
          });
        }
     
        if (req.files.length) {
          await cloudinary.uploader.destroy(data.imageId);
          const result = await cloudinary.uploader.upload(req.files[0].path, { folder: company });
          updateData.images = [{ id: result.public_id, url: result.url }];
        }

        updateData.name = data.name;
        updateData.description = data.description;
        updateData.code = data.code;
        updateData.price = data.price;
        updateData.priceFormat = data.priceFormat;
        updateData.discountPrice = data.discountPrice;
        updateData.discountPriceFormat = data.discountPriceFormat;
        updateData.status = data.status;
        updateData.category = data.category;
        updateData.unit = data.unit;

        await new ComplementsController().updateComplements(JSON.parse(data.complements));
        await Model.findByIdAndUpdate(productId, updateData);

        res.status(200).json({ success: true, message: 'Produto atualizado.' });
      } catch (error) {
        LogUtils.errorLogger(error);
        return res.status(400).json({ 
          success: false, 
          message: 'Falha na requisição, tente novamente mais tarde' 
        });
      }
    });
  }

  async delete(req, res) {
    try {
      const { productId, companyId, page } = req.params;

      if (!productId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Produto não encontrado' 
        });
      }

      const product = await Model.findByIdAndDelete(productId, { new: true });
      
      if (product.images.length >= 1) {
        product.images.map(async (img) => await cloudinary.uploader.destroy(img.id));
      }

      await Model.updateMany(
        { companyId, category: product.category, displayPosition: { $gt: product.displayPosition } },
        { $inc: { displayPosition: -1 } }
      );
  
      const products = await Model.find({ companyId })
        .populate('category', 'title')
        .skip((page - 1) * 10)
        .limit(10)
        .exec();
        
      return res.status(200).json({ products });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(400).json({ success: false, message: 'Erro ao produto' });
    }
  }

  async updateImage(req, res) {
    try {
      await Model.findByIdAndUpdate(
        req.params.productId,
        { $push: { images: req.body } },
        { safe: true, upsert: true }
      );

      return res.status(200).send({ status: 'success' });
    } catch (error) {
      LogUtils.errorLogger(error);
      return res.status(400).send({ status: 'error' });
    }
  }

  async deleteImage(req, res) {
    const { imageId, productId } = req.params;

    try {
      cloudinary.uploader.destroy(imageId, (error, result) => console.log(result, error));

      const product = await Model.findByIdAndUpdate(
        productId,
        { $pull: { images: { id: imageId } } },
        { safe: true, upsert: true }
      );

      return res.status(200).send({ status: 'success' });
    } catch (error) {
      return res.status(400).send({ status: 'error' });
    }
  }
}

export default ProductController;
