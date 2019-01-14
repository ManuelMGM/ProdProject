const { Sequelize, sequelize } = require('./db');

const dbTypeProduct = sequelize.define('typesProducts', {
    description: { type: Sequelize.STRING, allowNull: false, unique: true }
});

class TypeProduct {
    constructor() {        
        this.create =  async ({ description }) => {
            try {
                await sequelize
                    .sync();
                const result = await dbTypeProduct.create({
                    description
                });
                
                return result;
            } catch (e) {
                console.error(e);
            }
        }

        this.getAll = () => {

            return dbTypeProduct.findAll( {
                attributes: [ "id", "description" ]
            })
        }

        this.getProduct = ( description ) => {
            
            return dbTypeProduct.findAll( {
                where: { description },
                attributes: [ "id", "description" ]
            })            
        }



    }
}

module.exports = new TypeProduct();