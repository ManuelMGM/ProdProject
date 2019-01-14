const { Sequelize, sequelize } = require('./db');

const dbSaleDetail = sequelize.define('salesDetails', {
    item: { type: Sequelize.INTEGER },
    saleNumber: { type: Sequelize.BIGINT, allowNull: false },
    type: { type: Sequelize.CHAR, allowNull: false },
    codProduct: { type: Sequelize.STRING },
    quantity: { type: Sequelize.FLOAT, validate: { isNumeric: true }},
    price: { type: Sequelize.FLOAT },
});

// dbSaleDetail.belongsTo(Sale, { foreignKey: 'saleNumber'} )
// dbSaleDetail.belongsTo(Sale, { foreignKey: 'type'} )
// dbSaleDetail.hasOne(Product, { foreignKey: 'codProduct'} )


class SaleDetail {
    constructor() {
        this.create = async ({ item, saleNumber, type, codProduct, quantity }) => {
            try {
                await sequelize
                    .sync();
                const result = await dbSaleDetail.create({
                    item,
                    saleNumber,
                    type,
                    codProduct,
                    quantity,
                });
                
                return result;
            } catch (e) {
                console.error(e);
            }
        }

        this.getAll = (saleNumber) => {

            return dbSaleDetail.findAll( {
                where: { saleNumber },
                attributes: [ "item", "saleNumber", "type", "codProduct", "quantity" ]
            })
        }

    }
}

module.exports = new SaleDetail();