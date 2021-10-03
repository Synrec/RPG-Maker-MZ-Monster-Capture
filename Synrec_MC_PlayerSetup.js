/*:@author Synrec 
 * @target MZ
 *
 * @plugindesc v1.0 Enables advanced non-battler player setup
 *
 * @help
 * This plugin follows the permissions outlined in Synrec_MC_Core.js
 * 
 * Allows for player determined scene in which certain parameters can
 * be modified in game based on certain conditions.
 * 
 * 
 * @param Gameplay
 * 
 * @param No Gameover
 * @desc Prevents gameover to title screen.
 * @type boolean
 * @default false
 * @parent Gameplay
 * 
 * @param Gameover Map
 * @parent No Gameover
 * 
 * @param Gameover Map ID
 * @desc Map ID of Map Transported to on gameover
 * @type number
 * @default 1
 * @parent Gameover Map
 * 
 * @param Gameover Map X
 * @desc Map X of Map Transported to on gameover
 * @tye number
 * @default 1
 * @parent Gameover Map
 * 
 * @param Gameover Map Y
 * @desc Map Y of Map Transported to on gameover
 * @tye number
 * @default 1
 * @parent Gameover Map
 * 
 * @param Gameover Penalty
 * @desc Penalty that happens with no gameover setting
 * @type select[]
 * @option goldPercent
 * @option expPercent
 * @option goldFlat
 * @option expFlat
 * 
 * @param Gameover Gold Penalty Percentage
 * @desc Gold penalty percentage
 * @type number
 * @decimals 2
 * @min 0
 * @max 1
 * @parent Gameover Penalty
 * 
 * @param Gameover Gold Penalty Flat
 * @desc Gold penalty flat number
 * @type number
 * @min 0
 * @parent Gameover Penalty
 * 
 * @param Gameover Exp Penalty Percentage
 * @desc Exp penalty percentage
 * @type number
 * @decimals 2
 * @min 0
 * @max 1
 * @parent Gameover Penalty
 * 
 * @param Gameover Exp Penalty Flat
 * @desc Exp penalty flat number
 * @type number
 * @min 0
 * @parent Gameover Penalty
 * 
 * @param Global Level Cap
 * @desc Use a global level cap
 * @type boolean
 * @default false
 * @parent Gameplay
 * 
 * @param Level Cap Variable
 * @desc Variable which determines the level cap globally.
 * @type variable
 * @default 1
 * @parent Global Level Cap
 * 
 * @param Effect Level Mode
 * @desc Uses global level cap to limit stat growth instead.
 * @type boolean
 * @default false
 * @parent Global Level Cap
 * 
 * @param Graphics
 * 
 * @param Max Followers
 * @desc Maximum Number of followers for player
 * @type number
 * @default 1
 * @parent Graphics
 * 
 * @param Player Dash Sprite
 * @desc Changes player graphic when dashing
 * @type boolean
 * @default false
 * @parent Graphics
 * 
 * @param Player Dash Sprite File
 * @desc File for player dash sprite
 * @type file
 * @dir img/characters
 * @default Actor1
 * @parent Player Dash Sprite
 * 
 * @param Player Dash Sprite Index
 * @desc Index for player dash sprite
 * @type number
 * @min 0
 * @max 7
 * @default 2
 * @parent Player Dash Sprite
 * 
 * @param Player Damage Floor Animation
 * @desc Allows certain regions to produce floor damage with animation
 * @type struct<FloorDmg>[]
 * @default[]
 * @parent Gameplay
 * 
 * @param Party Switches
 * @desc Set switches which enable certain party abilities
 * 
 * @param Double Gold
 * @desc Double gold reward from battles
 * @type switch
 * @default 1
 * @parent Party Switches
 * 
 * @param Double EXP
 * @desc Double exp reward from battles
 * @type switch
 * @default 2
 * @parent Party Switches
 * 
 * @param Double Item
 * @desc Double item reward from battles
 * @type switch
 * @default 3
 * @parent Party Switches
 * 
 * @param No Surprise
 * @desc Remove surprise battles. Does not disable encounters.
 * @type switch
 * @default 4
 * @parent Party Switches
 * 
 * @param Raise Preemptive
 * @desc Increase rate of Preemptive battles.
 * @type switch
 * @default 5
 * @parent Party Switches
 * 
 * @param Encounter Half
 * @desc Encounter rate reduced by half. Half has much battles occur.
 * @type switch
 * @default 6
 * @parent Party Switches
 * 
 */
/*~struct~FloorDmg:
 *
 * @param Region ID
 * @desc Region ID used for this damage type
 * @type number
 * @min 1
 * @max 255
 * @default 1
 * 
 * @param Region Animation
 * @desc Animation used for this damage type
 * @type animation
 * @default 1
 * 
 * @param Region State
 * @desc State granted for this damage type. No state if value = 0
 * @type state
 * @default 0
 * 
 * @param Region State Chance
 * @desc State granted for this damage type
 * @type number
 * @default 1
 * @decimals 2
 * @min 0.01
 * @max 1
 *
 * @param Region Damage Formulae
 * @desc Damage inflicted to team. Evaluated as a script. Can use flat value
 * @default 100
 */



if(!SynrecMC)throw new Error("Core Plugin Missing.");
if(!isObject(SynrecMC))throw new Error("Bad Core Files.");
SynrecMC.PlayerSetup = {};
SynrecMC.PlayerSetup.Version = "1.0";

SynrecMC.PlayerSetup.Plugins = PluginManager.parameters('Synrec_MC_PlayerSetup');
SynrecMC.PlayerSetup.noGameover = SynrecMC.permaDeath ? false : eval(SynrecMC.PlayerSetup.Plugins['No Gameover']);
SynrecMC.PlayerSetup.noGameoverMapID = eval(SynrecMC.PlayerSetup.Plugins['Gameover Map ID']);
SynrecMC.PlayerSetup.noGameoverMapX = eval(SynrecMC.PlayerSetup.Plugins['Gameover Map X']);
SynrecMC.PlayerSetup.noGameoverMapY = eval(SynrecMC.PlayerSetup.Plugins['Gameover Map Y']);


SynrecMC.PlayerSetup.gameOverPenaltyArray = SynrecMC.PlayerSetup.Plugins['Gameover Penalty'];
SynrecMC.PlayerSetup.gameOverGoldPerc = eval(SynrecMC.PlayerSetup.Plugins['Gameover Gold Penalty Percentage']);
SynrecMC.PlayerSetup.gameOverGoldFlat = eval(SynrecMC.PlayerSetup.Plugins['Gameover Gold Penalty Flat']);
SynrecMC.PlayerSetup.gameOverExpPerc = eval(SynrecMC.PlayerSetup.Plugins['Gameover Exp Penalty Percentage']);
SynrecMC.PlayerSetup.gameOverExpFlat = eval(SynrecMC.PlayerSetup.Plugins['Gameover Exp Penalty Flat']);


SynrecMC.PlayerSetup.globalLevel = eval(SynrecMC.PlayerSetup.Plugins['Global Level Cap']);
SynrecMC.PlayerSetup.globalLevelVar = eval(SynrecMC.PlayerSetup.Plugins['Level Cap Variable']);
SynrecMC.PlayerSetup.globalLevelEfct = eval(SynrecMC.PlayerSetup.Plugins['Effect Level Mode']);


SynrecMC.PlayerSetup.usePlayerDashie = eval(SynrecMC.PlayerSetup.Plugins['Player Dash Sprite']);
SynrecMC.PlayerSetup.usePlayerDashieFile = SynrecMC.PlayerSetup.Plugins['Player Dash Sprite File'];
SynrecMC.PlayerSetup.usePlayerDashieIndex = eval(SynrecMC.PlayerSetup.Plugins['Player Dash Sprite Index']);
SynrecMC.PlayerSetup.maxFollowers = eval(SynrecMC.PlayerSetup.Plugins['Max Followers']);


SynrecMC.PlayerSetup.damageRegions = JSON.parse(SynrecMC.PlayerSetup.Plugins['Player Damage Floor Animation']);
for(dR = 0; dR < SynrecMC.PlayerSetup.damageRegions.length; dR++){
    SynrecMC.PlayerSetup.damageRegions[dR] = JSON.parse(SynrecMC.PlayerSetup.damageRegions[dR]);
    SynrecMC.PlayerSetup.damageRegions[dR]['Region ID'] = eval(SynrecMC.PlayerSetup.damageRegions[dR]['Region ID']);
    SynrecMC.PlayerSetup.damageRegions[dR]['Region Animation'] = eval(SynrecMC.PlayerSetup.damageRegions[dR]['Region Animation']);
    SynrecMC.PlayerSetup.damageRegions[dR]['Region State'] = eval(SynrecMC.PlayerSetup.damageRegions[dR]['Region State']);
    SynrecMC.PlayerSetup.damageRegions[dR]['Region State Chance'] = eval(SynrecMC.PlayerSetup.damageRegions[dR]['Region State Chance']);
}

SynrecMC.PlayerSetup.switchDoubleGold = eval(SynrecMC.PlayerSetup.Plugins['Double Gold']);
SynrecMC.PlayerSetup.switchDoubleExp = eval(SynrecMC.PlayerSetup.Plugins['Double EXP']);
SynrecMC.PlayerSetup.switchDoubleItem = eval(SynrecMC.PlayerSetup.Plugins['Double Item']);
SynrecMC.PlayerSetup.switchNoSurprise = eval(SynrecMC.PlayerSetup.Plugins['No Surprise']);
SynrecMC.PlayerSetup.switchRaisePreemptive = eval(SynrecMC.PlayerSetup.Plugins['Raise Preemptive']);
SynrecMC.PlayerSetup.switchEncounterHalf = eval(SynrecMC.PlayerSetup.Plugins['Encounter Half']);

synrecMCScnGameOverUpdate = Scene_Gameover.prototype.update;
Scene_Gameover.prototype.update = function() {
    if (this.isActive() && !this.isBusy() && this.isTriggered()) {
        if(SynrecMC.PlayerSetup.noGameover){
            this.processPenalty();
            const mapId = SynrecMC.PlayerSetup.noGameoverMapID;
            const mapX = SynrecMC.PlayerSetup.noGameoverMapX;
            const mapY = SynrecMC.PlayerSetup.noGameoverMapY;
            const dir = $gamePlayer.direction();
            $gameParty._actors.forEach(actor => actor.recoverAll());
            $gamePlayer.reserveTransfer(mapId, mapX, mapY, dir, 0);
        }else synrecMCScnGameOverUpdate.call(this);
    }
    synrecMCScnGameOverUpdate.call(this);
}

Scene_Gameover.prototype.processPenalty = function(){
    const gold = $gameParty.gold();
    const goldPercReduc = SynrecMC.PlayerSetup.gameOverGoldPerc * gold;
    const goldFlatReduc = SynrecMC.PlayerSetup.gameOverGoldFlat;
    let totalGoldReduc = goldFlatReduc + goldPercReduc;
    if(isNaN(totalGoldReduc))totalGoldReduc = 1;
    $gameParty._gold -= totalGoldReduc;
    $gameParty._actors.forEach((actor)=>{
        let currentExp = actor.currentExp();
        let expPercReduc = currentExp * SynrecMC.PlayerSetup.gameOverExpPerc;
        let expFlatReduc = SynrecMC.PlayerSetup.gameOverExpFlat;
        let totalReducExp = expPercReduc + expFlatReduc;
        if(isNaN(totalReducExp))totalReducExp = 1;
        actor.changeExp(-totalReducExp, true);
    });
}

synrecGmActorParamBase = Game_Actor.prototype.paramBase;
Game_Actor.prototype.paramBase = function(paramId) {
    $gameParty.setGlobalLevel();
    const globLvl = SynrecMC.PlayerSetup.globalLevel;
    if(globLvl){
        const global = $gameParty._globalLevel;
        const local = this._level;
        const level = Math.min(local, global);
        return this.currentClass().params[paramId][level];
    }
    synrecGmActorParamBase.call(this, paramId);
}

synrecGmActorMaxLvl = Game_Actor.prototype.maxLevel;
Game_Actor.prototype.maxLevel = function() {
    const globLvl = SynrecMC.PlayerSetup.globalLevel;
    const effLevel = SynrecMC.PlayerSetup.globalLevelEfct;
    if(globLvl && !effLevel)return $gameParty._globalLevel ? $gameParty._globalLevel : this.actor().maxLevel;
    synrecGmActorMaxLvl.call(this);
}

synrecGmActorLevelUp = Game_Actor.prototype.levelUp;
Game_Actor.prototype.levelUp = function() {
    const globLvl = SynrecMC.PlayerSetup.globalLevel;
    const effLevel = SynrecMC.PlayerSetup.globalLevelEfct;
    if(globLvl && !effLevel && this._level + 1 > $gameParty._globalLevel)return;
    synrecGmActorLevelUp.call(this);
    if(globLvl && effLevel){
        for (const learning of this.currentClass().learnings) {
            if (learning.level <= $gameParty._globalLevel && this._level >= $gameParty._globalLevel) {
                this.learnSkill(learning.skillId);
            }
        }
    }
}

synrecGmActorChkFlrEfct = Game_Actor.prototype.checkFloorEffect;
Game_Actor.prototype.checkFloorEffect = function() {
    synrecGmActorChkFlrEfct.call(this);
    if($gamePlayer.isOnRegionDamage()){
        this.executeRegionDamage();
    }
}

Game_Actor.prototype.executeRegionDamage = function(){
    const regionDamage = (id) =>{
        for(ib = 0; ib < SynrecMC.PlayerSetup.damageRegions.length; ib++){
            if(SynrecMC.PlayerSetup.damageRegions[ib]['Region ID'] == id){
                this._regionState = SynrecMC.PlayerSetup.damageRegions[ib]['Region State'];
                this._regionStateChnce = SynrecMC.PlayerSetup.damageRegions[ib]['Region State Chance'];
                this._regionAnim = SynrecMC.PlayerSetup.damageRegions[ib]['Region Animation'];
                return SynrecMC.PlayerSetup.damageRegions[ib]['Region Damage Formulae'];
            }
        }
    }
    const regionId = $gameMap.regionId($gamePlayer._x, $gamePlayer._y);
    const damage = eval(regionDamage(regionId));
    this.gainHp(-damage);
    $gameTemp.requestAnimation([$gamePlayer], this._regionAnim);
    if(this._regionState > 0){
        if(Math.random() < this._regionStateChnce){
            this.addState(this._regionState);
        }
    }
    $gameParty.refresh();
}

Game_Party.prototype.setGlobalLevel = function(){
    this._globalLevel = Math.max(1, $gameVariables.value(SynrecMC.PlayerSetup.globalLevelVar));
}

synrecGmPartyEncHalf = Game_Party.prototype.hasEncounterHalf;
Game_Party.prototype.hasEncounterHalf = function() {
    const switchId = SynrecMC.PlayerSetup.switchEncounterHalf;
    const switchState = $gameSwitches.value(switchId);
    if(switchState)return true;
    return synrecGmPartyEncHalf.call(this);
}

synrecGmPartyCnlSuprise = Game_Party.prototype.hasCancelSurprise;
Game_Party.prototype.hasCancelSurprise = function() {
    const switchId = SynrecMC.PlayerSetup.switchNoSurprise;
    const switchState = $gameSwitches.value(switchId);
    if(switchState)return true;
    return synrecGmPartyCnlSuprise.call(this);
}

synrecGmPartyRsPreemptive = Game_Party.prototype.hasRaisePreemptive;
Game_Party.prototype.hasRaisePreemptive = function() {
    const switchId = SynrecMC.PlayerSetup.switchRaisePreemptive;
    const switchState = $gameSwitches.value(switchId);
    if(switchState)return true;
    return synrecGmPartyRsPreemptive.call(this);
}

synrecGmPartyDoubleGld = Game_Party.prototype.hasGoldDouble;
Game_Party.prototype.hasGoldDouble = function() {
    const switchId = SynrecMC.PlayerSetup.switchDoubleGold;
    const switchState = $gameSwitches.value(switchId);
    if(switchState)return true;
    return synrecGmPartyDoubleGld.call(this);
}

synrecGmPartyDoubleItm = Game_Party.prototype.hasDropItemDouble;
Game_Party.prototype.hasDropItemDouble = function() {
    const switchId = SynrecMC.PlayerSetup.switchDoubleItem;
    const switchState = $gameSwitches.value(switchId);
    if(switchState)return true;
    return synrecGmPartyDoubleItm.call(this);
}

Game_Party.prototype.hasExpDouble = function() {
    const switchId = SynrecMC.PlayerSetup.switchDoubleExp;
    const switchState = $gameSwitches.value(switchId);
    if(switchState)return true;
    return false;
}

synrecGmTroopXpTotal = Game_Troop.prototype.expTotal;
Game_Troop.prototype.expTotal = function() {
    return synrecGmTroopXpTotal.call(this) * this.expRate();
}

Game_Troop.prototype.expRate = function(){
    return $gameParty.hasExpDouble() ? 2 : 1;
}

synrecMCGmPlayerUpDash = Game_Player.prototype.updateDashing;
Game_Player.prototype.updateDashing = function() {
    synrecMCGmPlayerUpDash.call(this);
    if(SynrecMC.PlayerSetup.usePlayerDashie){
        if(this._dashing && !this._dashie){
            const dashFile = SynrecMC.PlayerSetup.usePlayerDashieFile;
            const dashIndex = SynrecMC.PlayerSetup.usePlayerDashieIndex;
            this.setImage(dashFile, dashIndex);
            this._dashie = true;
        }else if(!this._dashing && this._dashie){
            const normFile = SynrecMC.nonBattlePlayerFile;
            const normIndex = SynrecMC.nonBattlePlayerIndex;
            this.setImage(normFile, normIndex);
            this._dashie = false;
        }
    }
}

Game_Player.prototype.isOnRegionDamage = function(){
    return this.onDamageRegion();
}

Game_Player.prototype.onDamageRegion = function(){
    const damageRegionId = (id) =>{
        for(ib = 0; ib < SynrecMC.PlayerSetup.damageRegions.length; ib++){
            if(SynrecMC.PlayerSetup.damageRegions[ib]['Region ID'] == id){
                return true;
            }
        }
    }
    const regionId = $gameMap.regionId(this._x, this._y);
    if(damageRegionId(regionId))return true;
    return false;
}

synrecGameFollowersSetupPS = Game_Followers.prototype.setup;
Game_Followers.prototype.setup = function() {
	if(SynrecMC.nonBattlePlayer){
        const follNum = isNaN(SynrecMC.PlayerSetup.maxFollowers) ? $gameParty.maxBattleMembers() : SynrecMC.PlayerSetup.maxFollowers;
		this._data = [];
		for (var i = 0; i < follNum; i++) {
			this._data.push(new Game_Follower(i));
		}
	}else{
		synrecGameFollowersSetupPS.call(this);
	}
}