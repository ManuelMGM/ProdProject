const { Sequelize, sequelize } = require('./db');

const dbProductType = sequelize.define('productsTypes', {
    description: { type: Sequelize.STRING, allowNull: false, unique: true }
});

class ProductType {
    constructor() {        
        this.create =  async ({ description }) => {
            try {
                await sequelize
                    .sync();
                const result = await dbProductType.create({
                    description
                });
                
                return result;
            } catch (e) {
                console.error(e);
            }
        }

        this.getAll = () => {

            return dbProductType.findAll( {
                attributes: [ 'id', 'description' ]
            })
        }

        this.getProduct = ( description ) => {
            
            return dbProductType.findAll( {
                where: { description },
                attributes: [ 'id', 'description' ]
            })            
        }



    }
}

module.exports = new ProductType();