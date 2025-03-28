import fs from 'fs';
import Model from '../../models/CompanyModel.js';
import { v2 as cloudinary } from 'cloudinary';
import { upload } from '../../settings/multer.js';
import { LogUtils } from '../../utils/LogUtils.js';


class CustomizationController {
  async updateAppearance(req, res) {
    try {
      const companyId = req.headers.companyid;
      const { 
        fantasyName, description, colorPrimary, colorSecondary, slogan,
      } = req.body;

      const updatedCompany = await Model.findOneAndUpdate(
        { _id: companyId },
        {
          $set: {
            'custom.colorPrimary': colorPrimary,
            'custom.colorSecondary': colorSecondary,
            fantasyName,
            description,
            slogan,
          },
        },
        { new: true }
      );

      return res.status(200).json(updatedCompany);
    } catch (error) {
      LogUtils.errorLogger(error);
    }
  }

  async updateLogo(req, res) {
    upload.single('logo')(req, res, async (err) => {
      try {
        const companyId = req.headers.companyid;

        if (!req.file)
          return res.status(400).json({
            success: false,
            message: 'Não foi possível atualizar o logo',
          });

        const { custom } = await Model.findById(companyId, 'custom.logo');
        if (custom.logo.url) await cloudinary.uploader.destroy(custom.logo.id);

        const upload = await cloudinary.uploader.upload(req.file.path, {
          folder: companyId,
        });

        await Model.findByIdAndUpdate(companyId, {
          $set: { 'custom.logo': { url: upload.url, id: upload.public_id } },
        });

        fs.unlink(req.file.path, (err) => { });

        res.status(200).json({ url: upload.url, id: upload.public_id });
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Erro ao atualizar a logo',
        });
      }
    });
  }

  async updateBackgroundImage(req, res) {
    upload.single('backgroundImage')(req, res, async (err) => {
      try {
        const companyId = req.headers.companyid;

        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'Não foi possível atualizar a imagem',
          });
        }

        const { custom } = await Model.findById(companyId, 'custom.backgroundImage');

        if (custom.BackgroundImage?.url) {
          await cloudinary.uploader.destroy(custom.BackgroundImage.id);
        }

        const upload = await cloudinary.uploader.upload(req.file.path, {
          folder: companyId,
        });

        await Model.findByIdAndUpdate(companyId, {
          $set: { 'custom.backgroundImage': { url: upload.url, id: upload.public_id } },
        });

        fs.unlink(req.file.path, (err) => { });
  
        res.status(200).json({ url: upload.url, id: upload.public_id });
      } catch (error) {
        LogUtils.errorLogger(error);
        return res
          .status(400)
          .json({ success: false, message: 'Erro ao atualizar a imagem de fundo' });
      }
    });
  }

  async removeImageLogo(req, res) {
    try {
      const companyId = req.headers.companyid;
      const { id } = req.params;

      const result = await cloudinary.uploader.destroy(id);
      await Model.findByIdAndUpdate(companyId, { $set: { 'custom.logo': null } });

      return res.status(200).json({ success: true, message: 'Logo excluída' });
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, message: 'Não foi possivel excluir logo' });
    }
  }

  async addImageGallery(req, res) {
    upload.single('image')(req, res, async (err) => {
      try {
        const companyId = req.headers.companyid;
        let image;

        if (req.file) {
          const upload = await cloudinary.uploader.upload(req.file.path, {
            folder: companyId,
          });
          image = { url: upload.url, id: upload.public_id };
        }

        if (!image) {
          res
            .status(400)
            .json({
              success: false,
              message: 'Não foi possível atualizar a galeria',
            });
          return;
        }

        const company = await Model.findByIdAndUpdate(
          companyId,
          { $push: { 'custom.gallery': { $each: [image] } } },
          { new: true }
        );

        res.status(200).json(company.custom.gallery);
      } catch (error) {
        return res
          .status(400)
          .json({
            success: false,
            message: 'Falha na requisição, tente novamente mais tarde',
          });
      }
    });
  }

  async removeImageGallery(req, res) {
    try {
      const companyId = req.headers.companyid;
      const { id } = req.params;

      await cloudinary.uploader.destroy(id);

      const company = await Model.findOneAndUpdate(
        { _id: companyId },
        { $pull: { 'custom.gallery': { id } } },
        { new: true }
      );

      res.status(200).json(company.custom.gallery);
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, message: 'Não foi possivel excluir logo' });
    }
  }
}

export default CustomizationController;
