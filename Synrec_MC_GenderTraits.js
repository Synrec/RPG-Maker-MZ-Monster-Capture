/*:@author Synrec 
 * @target MZ
 *
 * @plugindesc v1.1 Enables gender traits
 *
 * @help
 * This plugin follows the permissions outlined in Synrec_MC_Core.js
 * 
 * Modifies the EX and SP parameter calculation for actors based on their gender.
 * 
 * 
 */

if(SynrecMC){
    SynrecMC.GenderTraits = {};
    SynrecMC.GenderTraits.version = '1.1';
}else{
    throw new Error("Core Plugin Missing.");
}

Game_BattlerBase.prototype.getGenderParamsX = function(xparamId){
    const genderName = this._gender;
    const genderData = () =>{
        let genders = SynrecMC.genders;
        for(genIdx = 0; genIdx < genders.length; genIdx++){
            if(genders[genIdx]['Gender Name'] == genderName){
                return genders[genIdx];
            }
        }
        return 0;
    };
    switch(xparamId){
        case 0:
            return genderData()['Hit Rate'];
        case 1:
            return genderData()['Evasion Rate'];
        case 2:
            return genderData()['Critical Rate'];
        case 3:
            return genderData()['Critical Evasion'];
        case 4:
            return genderData()['Magic Evasion'];
        case 5:
            return genderData()['Magic Reflection'];
        case 6:
            return genderData()['Counter Attack'];
        case 7:
            return genderData()['HP Regen'];
        case 8:
            return genderData()['MP Regen'];
        case 9:
            return genderData()['TP Regen'];
    }
}

Game_BattlerBase.prototype.getGenderParamsS = function(sparamId){
    const genderName = this._gender;
    const genderData = () =>{
        let genders = SynrecMC.genders;
        for(genIdx = 0; genIdx < genders.length; genIdx++){
            if(genders[genIdx]['Gender Name'] == genderName){
                return genders[genIdx];
            }
        }
        return 0;
    };
    switch(sparamId){
        case 0:
            return genderData()['Target Rate'];
        case 1:
            return genderData()['Guard Effect'];
        case 2:
            return genderData()['Recovery Effect'];
        case 3:
            return genderData()['Pharmacology'];
        case 4:
            return genderData()['MP Cost Rate'];
        case 5:
            return genderData()['TP Charge Rate'];
        case 6:
            return genderData()['Physical Damage'];
        case 7:
            return genderData()['Magical Damage'];
        case 8:
            return genderData()['Floor Damage'];
        case 9:
            return genderData()['Experience'];
    }
}

Game_BattlerBase.prototype.xparam = function(xparamId) {
    const baseTrait = this.traitsSum(Game_BattlerBase.TRAIT_XPARAM, xparamId);
    let gendTrait = this.getGenderParamsX(xparamId);
    if(isNaN(gendTrait))gendTrait = 0;
    const sumTrait = baseTrait + gendTrait;
    return sumTrait;
}

Game_BattlerBase.prototype.sparam = function(sparamId) {
    const baseTrait = this.traitsPi(Game_BattlerBase.TRAIT_SPARAM, sparamId);
    let gendTrait = this.getGenderParamsS(sparamId);
    if(isNaN(gendTrait))gendTrait = 1;
    const piTrait = baseTrait * gendTrait;
    return piTrait;
}