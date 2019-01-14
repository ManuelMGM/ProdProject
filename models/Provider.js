const { Sequelize, sequelize } = require('./db');

const dbProvider = sequelize.define('providers', {
    cuit: { type: Sequelize.BIGINT, allowNull: false, unique: true },
    name: { type: Sequelize.STRING, allowNull: false },
    razonSocial: { type: Sequelize.STRING },
    apellido: { type: Sequelize.STRING },
    email: { type: Sequelize.STRING, validate: { isEmail: true } }
});

class Provider {
    constructor() {
        this.create = async ({ cuit, name, razonSocial, apellido, email }) => {
            try {
                await sequelize
                    .sync();
                const result = await dbProvider.create({
                    cuit,
                    name,
                    razonSocial,
                    apellido,
                    email
                });
                
                return result;
            } catch (e) {
                console.error(e);
            }
        }

        this.getAll = () => {

            return dbProvider.findAll( {
                attributes: [ 'cuit', 'name', 'razonSocial', 'apellido', 'email' ]
            });
        }

        this.getProvider = ( id ) => {
            
            return dbProvider.findAll( {
                where: { id },
                attributes: [ 'cuit', 'name', 'razonSocial', 'apellido', 'email' ]
            });
        }


    }
}

module.exports = new Provider();