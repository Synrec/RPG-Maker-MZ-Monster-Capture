/*:@author Synrec 
 * @target MZ
 *
 * @plugindesc v1.0 Battle Core for the Monster Capture System.
 *
 *@help
 * This plugin inherits the permissions outlined in Synrec_MC_Core.js
 * 
 * Modifies the battle system to allow for 1v1, 2v2, 3v1, etc style battles.
 * 
 * You can set actor battler limit in battle with script call:
 * $gameTemp._numBattleActors = x [x = number]
 * $gameTemp._numBattleEnemies = x [x = number]
 * 
 * Instructions for use may be found on my webpage https://synrec.dev
 * 
 * @param Gameplay
 * 
 * @param Default Number of Actor Battlers
 * @desc Maximum number of actor battlers. Changeable in game.
 * @type number
 * @default 4
 * @parent Gameplay
 * 
 * @param Default Number of Enemy Battlers
 * @desc Maximum number of enemy battlers. Changeable in game.
 * @type number
 * @default 8
 * @parent Gameplay
 * 
 * @param Max Battle Members
 * @desc Maximum number of party members
 * @type number
 * @default 4
 * @parent Gameplay
 * 
 * @param Enable Team Command
 * @desc Can change active battler
 * @type boolean
 * @default true
 * @parent Gameplay
 * 
 * @param Skip Turn on Swap
 * @desc Can change active battler
 * @type boolean
 * @default true
 * @parent Gameplay
 * 
 * @param UI
 * 
 * @param Team Command Name
 * @desc Name of Team Command that shows on party command
 * @type text
 * @default Party
 * 
 * @param Battling Text
 * @desc Text that shows if actor is battling
 * @type text
 * @default Battling
 * 
 * @param Stand-By Text
 * @desc Text that shows if actor is stand by
 * @type text
 * @default Stand-By
 * 
 */

if(!SynrecMC)throw new Error("Core Plugin Missing.");
if(!isObject(SynrecMC))throw new Error("Bad Core Files.");
SynrecMC.Battle = {};
SynrecMC.Battle.Version = "1.0";

SynrecMC.Battle.Plugins = PluginManager.parameters('Synrec_MC_BattleCore');
SynrecMC.Battle.MaxActorBattler = eval(SynrecMC.Battle.Plugins['Default Number of Actor Battlers']);
SynrecMC.Battle.MaxEnemyBattler = eval(SynrecMC.Battle.Plugins['Default Number of Enemy Battlers']);
SynrecMC.Battle.maxBattlers = eval(SynrecMC.Battle.Plugins['Max Battle Members']);
SynrecMC.Battle.partyCmd = eval(SynrecMC.Battle.Plugins['Enable Team Command']);
SynrecMC.Battle.swapSkip = eval(SynrecMC.Battle.Plugins['Skip Turn on Swap']);

SynrecMC.Battle.teamName = SynrecMC.Battle.Plugins['Team Command Name'];
SynrecMC.Battle.battlingText = SynrecMC.Battle.Plugins['Battling Text'];
SynrecMC.Battle.standbyText = SynrecMC.Battle.Plugins['Stand-By Text'];

BattleManager.setTeamMenu = function(teamMenu){
    this._teamMenu = teamMenu;
}

synrecBMstartBattle = BattleManager.startBattle;
BattleManager.startBattle = function() {
    synrecBMstartBattle.call(this);
    this.processActiveMembers();
}

BattleManager.processActiveMembers = function(){
    this._hasActor = true;
    this._hasEnemy = true;
    const setActors = $gameTemp._numBattleActors;
    const setEnemies = $gameTemp._numBattleEnemies;
    this._numActors = setActors ? setActors : SynrecMC.Battle.MaxActorBattler;
    this._numEnemies = setEnemies ? setEnemies : SynrecMC.Battle.MaxEnemyBattler;
    let partyLength = $gameParty._actors.length;
    let enemyLength = $gameTroop._enemies.length;
    $gameParty._actors.forEach(actor => actor.appear());
    if(this._numActors <= partyLength){
        for(i = partyLength - 1; i >= 0; i--){
            if(i >= this._numActors){
                $gameParty._actors[i].hide();
            }else{
                i = 0;
            }
        }
    }
    if(this._numEnemies <= enemyLength){
        for(i = enemyLength - 1; i >= 0; i--){
            if(i >= this._numEnemies){
                $gameTroop._enemies[i].hide();
            }else{
                i = 0;
            }
        }
    }
    $gameTemp._numBattleActors = undefined;
    $gameTemp._numBattleEnemies = undefined;
}

synrecBMprocessTurn = BattleManager.processTurn;
BattleManager.processTurn = function() {
    this.clearAutoAction();
    synrecBMprocessTurn.call(this);
}

BattleManager.clearAutoAction = function(){
    let scene = SceneManager._scene;
    scene._autoAction = undefined;
}

synrecBMchkBattleEnd = BattleManager.checkBattleEnd;
BattleManager.checkBattleEnd = function() {
    this.checkForHidden();
    if(this._hasActor && this._hasEnemy && !this.checkAbort())return;
    return synrecBMchkBattleEnd.call(this);
}

BattleManager.checkForHidden = function(){
    if(this.checkAbort())return;
    this._hasEnemy = false;
    this._hasActor = false;
    for(i = 0; i < $gameParty._actors.length; i++){
        if($gameParty._actors[i]._hp > 0){
            this._hasActor = true;
        }
    }
    for(i = 0; i < $gameTroop._enemies.length; i++){
        if($gameTroop._enemies[i]._hp > 0){
            this._hasEnemy = true;
        }
    }
}

synrecGmBattlerMakeAct = Game_Battler.prototype.makeActions;
Game_Battler.prototype.makeActions = function() {
    synrecGmBattlerMakeAct.call(this);
    if(this.isDead()){
        this.setActionState("switchOut");
        this.performSwap();
    }
}

Game_Actor.prototype.performSwap = function(){
    this.hide();
}

Game_Enemy.prototype.performSwap = function(){
    let troopEnemies = $gameTroop._enemies;
    let aliveEnems = [];
    for(i = 0; i < troopEnemies.length; i++){
        if(troopEnemies[i]._hp > 0)aliveEnems.push(troopEnemies[i]);
    }
    this.performSmartShowing(aliveEnems);
}

Game_Enemy.prototype.performSmartShowing = function(aliveEnemies){
    for(j = 0; j < aliveEnemies.length; j++){
        if(aliveEnemies[j]._hp > 0){
            this.hide();
            aliveEnemies[j].appear();
            $gameTemp.requestBattleRefresh();
            return aliveEnemies[j];
        }
    }
}

synrecGmPtyMaxBattleMembers = Game_Party.prototype.maxBattleMembers
Game_Party.prototype.maxBattleMembers = function() {
    return SynrecMC.Battle.maxBattlers ? SynrecMC.Battle.maxBattlers : synrecGmPtyMaxBattleMembers.call(this);
}

synrecScnBatUpdate = Scene_Battle.prototype.update;
Scene_Battle.prototype.update = function() {
    synrecScnBatUpdate.call(this)
    this.updateAutoAction();
}

Scene_Battle.prototype.updateAutoAction = function(){
    if(!this._actorCommandWindow.active)return;
    if(this._autoAction == 'guard'){
        if(BattleManager.actor()){
            this.commandGuard();
        }
    }
}

synrecScnBatCreateAllWindows = Scene_Battle.prototype.createAllWindows;
Scene_Battle.prototype.createAllWindows = function() {
    synrecScnBatCreateAllWindows.call(this);
    this.createSwapWindow();
}

Scene_Battle.prototype.createSwapWindow = function(){
    const width = this._statusWindow.width;
    const height = this._statusWindow.height;
    const x = this._statusWindow.x;
    const y = this._statusWindow.y;
    const rect = {x:x, y:y, width:width, height:height};
    this._swapWindow = new Window_BattleSwap(rect);
    this._swapWindow.setHandler('ok', this.triggerSwap.bind(this));
    this._swapWindow.setHandler('cancel', this.cancelSwap.bind(this));
    this._swapWindow.hide();
    this.addWindow(this._swapWindow);
}

synrecScnBatIsAnyInputWindowActive = Scene_Battle.prototype.isAnyInputWindowActive;
Scene_Battle.prototype.isAnyInputWindowActive = function() {
    return (
        synrecScnBatIsAnyInputWindowActive.call(this) ||
        this._swapWindow.active
    );
}

synrecScnBatChangeInputWindow = Scene_Battle.prototype.changeInputWindow;
Scene_Battle.prototype.changeInputWindow = function() {
    if($gameParty.deadMembers().length > 0 && 
    BattleManager.isInputting() &&
    $gameParty.aliveMembers().length < BattleManager._numActors){
        if(BattleManager._hasActor){
            this.swapBattler();
            return;
        }
    }
    if(this._swapWindow.active)return;
    synrecScnBatChangeInputWindow.call(this);
}

Scene_Battle.prototype.swapBattler = function(){
    this._swapWindow.show();
    this._swapWindow.activate();
    this._partyCommandWindow.hide();
    this._partyCommandWindow.deactivate();
}

Scene_Battle.prototype.triggerSwap = function(){
    const index = this._swapWindow.index();
    if(isNaN(index) || index < 0){
        SoundManager.playBuzzer();
        swapWindow._sActor1 = undefined;
        swapWindow._sActor2 = undefined;
    }
    let swapWindow = this._swapWindow;
    if(isNaN(swapWindow._sActor1)){
        swapWindow._sActor1 = index;
    }else if(!isNaN(swapWindow._sActor1)){
        swapWindow._sActor2 = index;
        if(swapWindow._sActor1 == swapWindow._sActor2){
            SoundManager.playBuzzer();
            swapWindow._sActor1 = undefined;
            swapWindow._sActor2 = undefined;
        }else{
            const index1 = swapWindow._sActor1;
            const index2 = swapWindow._sActor2;
            if($gameParty._actors[index1].isDead() && $gameParty._actors[index2].isDead()){
                SoundManager.playBuzzer();
                swapWindow._sActor1 = undefined;
                swapWindow._sActor2 = undefined;
            }else if($gameParty._actors[index2].isHidden()&& $gameParty._actors[index2]._hp > 0 && $gameParty._actors[index1].isAppeared()){
                SoundManager.playOk();
                $gameParty._actors[index1]._hidden = true;
                $gameParty._actors[index2]._hidden = false;
                swapWindow._sActor1 = undefined;
                swapWindow._sActor2 = undefined;
                this._swapWindow.hide();
                this._swapWindow.deactivate();
                this._swapWindow.refresh();
                this._partyCommandWindow.show();
                this._partyCommandWindow.activate();
                this._statusWindow.refresh();
                this.processTurnSwap();
                return;
            }else{
                SoundManager.playBuzzer();
                swapWindow._sActor1 = undefined;
                swapWindow._sActor2 = undefined;
            }
        }
    }
    this._swapWindow.show();
    this._swapWindow.activate();
}

Scene_Battle.prototype.cancelSwap = function(){
    this._swapWindow._sActor1 = undefined;
    this._swapWindow._sActor2 = undefined;
    this._swapWindow.hide();
    this._swapWindow.deactivate();
    this._partyCommandWindow.show();
    this._partyCommandWindow.activate();
}

Scene_Battle.prototype.processTurnSwap = function(){
    if(!SynrecMC.Battle.swapSkip)return;
    this.setAutoAction();
}

Scene_Battle.prototype.setAutoAction = function(){
    this._autoAction = 'guard';
    $gameParty.makeActions();
}

synrecWinPtyCmdMakeCommandList = Window_PartyCommand.prototype.makeCommandList;
Window_PartyCommand.prototype.makeCommandList = function() {
    synrecWinPtyCmdMakeCommandList.call(this);
    if(SynrecMC.Battle.partyCmd)this.addPartyCmd();
}

Window_PartyCommand.prototype.addPartyCmd = function(){
    this.addCommand(SynrecMC.Battle.teamName, 'party');
    let scene = SceneManager._scene;
    this.setHandler('party', scene.swapBattler.bind(scene));
}

function Window_BattleSwap(){
    this.initialize(...arguments);
}

Window_BattleSwap.prototype = Object.create(Window_Selectable.prototype);
Window_BattleSwap.prototype.constructor = Window_BattleSwap;

Window_BattleSwap.prototype.maxCols = function() {
    return $gameParty.maxBattleMembers() ? $gameParty.maxBattleMembers() : 4;
}

Window_BattleSwap.prototype.maxItems = function() {
    return $gameParty.maxBattleMembers() ? $gameParty.maxBattleMembers() : 4;
}

Window_BattleSwap.prototype.update = function(){
    Window_Selectable.prototype.update.call(this);
    this.updateData();
}

Window_BattleSwap.prototype.updateData = function(){
    const dataSet = $gameParty._actors;
    if(this._data != dataSet){
        this._data = dataSet;
        this.refresh();
    }
}

Window_BattleSwap.prototype.drawItem = function(index){
    const iconSize = Math.max(ImageManager.iconWidth, ImageManager.iconHeight);
    const faceSize = Math.max(ImageManager.faceWidth, ImageManager.faceHeight);
    const actor = this._data[index];
    const rect = this.itemRect(index);
    if(actor){
        if(actor.isDead()){
            this.changeTextColor(ColorManager.customColor('#ffbbbb'));
        }else if(actor.isDying()){
            this.changeTextColor(ColorManager.customColor('#ffffbb'));
        }else{
            this.resetTextColor();
        }
        const faceName = actor._faceName;
        const faceIndex = actor._faceIndex;
        this.drawFace(faceName, faceIndex, rect.x + 3, rect.y + 3, 144, 36);
        const name = actor._name;
        this.drawText(name, rect.x + iconSize, rect.y + 40, rect.width - iconSize + 4);
        const level = actor._level;
        const levelText = TextManager.levelA;
        this.drawText(`${levelText} ${level}`, rect.x, rect.y, rect.width, 'right');
        const gender = actor._gender;
        const genderIcon = () =>{
            let genders = SynrecMC.genders;
            for(genIdx = 0; genIdx < genders.length; genIdx++){
                if(genders[genIdx]['Gender Name'] == gender){
                    return genders[genIdx]['Gender Icon'];
                }
            }
            return 0;
        }
        this.drawIcon(genderIcon(), rect.x + 2, rect.y + 40);
        this.drawResourceGauges(actor, rect);
        if(actor.isAppeared()){
            this.drawText(SynrecMC.Battle.battlingText, rect.x, rect.y + 140, rect.width, 'center');
        }else{
            this.drawText(SynrecMC.Battle.standbyText, rect.x, rect.y + 140, rect.width, 'center');
        }
    }
}

Window_BattleSwap.prototype.drawResourceGauges = function(actor, rect){
    const currentHp = actor._hp;
    const currentMp = actor._mp;
    const currentTp = actor._tp;
    const maxHp = actor.param(0);
    const maxMp = actor.param(1);
    const maxTp = actor.maxTp();
    this.drawHpGuage(currentHp, maxHp, rect);
    this.drawMpGuage(currentMp, maxMp, rect);
    this.drawTpGuage(currentTp, maxTp, rect);
}

Window_BattleSwap.prototype.drawHpGuage = function(current, max, rect){
    const ratio = current / max;
    const width = rect.width - 6;
    const fillW = width * ratio;
    const x = rect.x + 3;
    const y = rect.y + 76;
    this.contents.fillRect(x, y, width, 12, '#000000');
    this.contents.gradientFillRect(x + 2, y + 2, width - 2, 10, ColorManager.hpGaugeColor1(), ColorManager.hpGaugeColor2());
}

Window_BattleSwap.prototype.drawMpGuage = function(current, max, rect){
    const ratio = current / max;
    const width = rect.width - 6;
    const fillW = width * ratio;
    const x = rect.x + 3;
    const y = rect.y + 90;
    this.contents.fillRect(x, y, width, 12, '#000000');
    this.contents.gradientFillRect(x + 2, y + 2, width - 2, 10, ColorManager.mpGaugeColor1(), ColorManager.mpGaugeColor2());
}

Window_BattleSwap.prototype.drawTpGuage = function(current, max, rect){
    const ratio = current / max;
    const width = rect.width - 6;
    const fillW = width * ratio;
    const x = rect.x + 3;
    const y = rect.y + 104;
    this.contents.fillRect(x, y, width, 12, '#000000');
    this.contents.gradientFillRect(x + 2, y + 2, width - 2, 10, ColorManager.tpGaugeColor1(), ColorManager.tpGaugeColor2());
}