import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){}
  async create(createPokemonDto: CreatePokemonDto) {
    try {
      createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase()
    const pokemon = await this.pokemonModel.create(createPokemonDto)
    return pokemon;
    } catch (error) {
      this.handleExceptions(error)
    }
    
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon:Pokemon;
    if(!isNaN(+term)){
      pokemon = await this.pokemonModel.findOne({no: term})
    }
    //MOngo id
    if(!pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term)
    }
    //Name
    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name: term.toLocaleLowerCase().trim()})
    }
    if(!pokemon) throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`)
    return pokemon
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    if(updatePokemonDto.name){
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase()
    }
    try {
      // Usamos findByIdAndUpdate con { new: true } para obtener el documento actualizado
    const updatedPokemon = await this.pokemonModel.findByIdAndUpdate(
      pokemon._id, 
      updatePokemonDto, 
      { new: true } // Esto asegura que se devuelva el documento actualizado
    );
    return updatedPokemon;
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async remove(id: string) {
    const result = await this.pokemonModel.deleteOne({_id: id})
    if(result.deletedCount === 0){
      throw new BadRequestException(`Pokemon with id "${id}" not found`)
    }
    return result;
  }
  private handleExceptions ( error : any){
    if(error.code === 11000){
      throw new BadRequestException(`Pokemon exist in db ${JSON.stringify(error.keyValue)}`)
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`)
  }
}
