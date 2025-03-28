import jwt from 'jsonwebtoken';
import { TomtomService } from './TomtomService.js';
import ProductsModel from "../models/ProductsModel.js";

export class MenuService {
  async estimateValue(listProduct) {
    try {
      const requestInfo = [];
      let priceTotal = 0;

      for (const item of listProduct) {
        const product = await ProductsModel.findById(item.productId)
          .populate({ path: 'complements', select: '-company' })
          .select('name price images.url')
          .exec();

        let priceOption = 0;
        let price = 0;
        const complements = [];

        if (product?.complements?.length > 0) {
          item.complements.map((option) => {
            const resultComplements = product.complements.find(
              (complement) => complement._id.toString() == option.parentId
            );
            const resultOption = resultComplements.options.find(
              (o) => o._id == option.id
            );

            for (let i = 0; i < option.quantity; i++) {
              priceOption += resultOption.price;
            }

            complements.push({
              name: resultOption.name,
              price: resultOption.price,
              parentId: option.parentId,
              quantity: option.quantity,
              id: resultOption._id,
            });
          });
        }

        for (let i = 0; i < item.quantity; i++) {
          price += product.price + priceOption;
        }

        priceTotal += price;

        requestInfo.push({
          complements,
          comment: item.comment || '',
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          priceTotal: price,
          imageUrl: product.images[0]['url'],
        });
      }
      return { products: requestInfo, subtotal: priceTotal };
    } catch (error) {
      console.error(error);
    }
  }

  async calculateDeliveryFee(adressCompany, addressClient, kmValue, minValue) {
    try {
      if (!addressClient.zipCode) throw new Error('A taxa não foi calculada automaticamente');
      if (!addressClient?.street) throw new Error('Rua não informada');
      if (!addressClient?.district) throw new Error('Bairro não informado');
      if (!addressClient?.city) throw new Error('Cidade não informada');
      if (!addressClient?.number) throw new Error('Número da casa não informado');

      const tomtomService = new TomtomService();
      const findAddress = await tomtomService.findAddress({ ...addressClient });
      const address = findAddress[0];
      const positions = [
        adressCompany.coordinates.latitude,
        adressCompany.coordinates.longitude,
        address['position']['lat'],
        address['position']['lon']
      ];
      const calculateDistance = await tomtomService.getDistance(...positions);
      const distanceInKm = calculateDistance.routes[0].summary.lengthInMeters / 1000;

      return {
        zipCode: address.address.extendedPostalCode,
        position: { latitude: address.position.lat, longitude: address.position.lon },
        distance: distanceInKm,
        price: (distanceInKm * kmValue) + minValue,
        number: address.address.streetNumber,
        street: address.address.streetName,
        district: address.address.municipalitySubdivision,
        city: address.address.municipality,
        freeformAddress: address.address.freeformAddress,
        deliveryOption: 'automatic',
        searchMethod: 'automatic'
      };
    } catch (error) {
      throw new Error('Erro ao calcular o frete');
    }
  }

  async addAddressManual(addressClient) {
    if (!addressClient?.street) throw new Error('Rua não informada');
    if (!addressClient?.district) throw new Error('Bairro não informado');
    if (!addressClient?.city) throw new Error('Cidade não informada');
    if (!addressClient?.number) throw new Error('Número da casa não informado');
    if (!addressClient?.reference) throw new Error('Referência de endereço não informada');

    return {
      zipCode: addressClient?.zipCode,
      number: addressClient.number,
      street: addressClient.street,
      district: addressClient.disctrict,
      city: addressClient.city,
      reference: addressClient.reference,
      deliveryOption: 'automatic',
      searchMethod: 'manual'
    };
  }

  calculateOrder(productsToken, addressToken) {
    const { totalProduct } = jwt.decode(productsToken);
    const address = jwt.decode(addressToken);

    if (address) return (totalProduct + address.price);

    return totalProduct;
  }
}