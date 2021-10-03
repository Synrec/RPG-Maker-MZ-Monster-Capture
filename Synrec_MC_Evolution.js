/*:@author Synrec 
 * @target MZ
 *
 * @plugindesc v1.1 Creates a simple scene which allows actor evolution
 * 
 * @help
 * This plugin follows the permissions outlined in Synrec_MC_Core.js
 * 
 * This plugin acts as the core for evolution for monster capture.
 * 
 * @param Gameplay
 * 
 * @param Evolve Healing
 * @desc Recover All On Evolve.
 * @type boolean
 * @default false
 * @parent Gameplay
 * 
 * @param Evolve Level Reset
 * @desc Reset level on evolution
 * @type boolean
 * @default false
 * @parent Gameplay
 * 
 * @param Graphics
 * 
 * @param Evolve Scene Background
 * @desc Background used for evolution scene
 * @type file
 * @dir img/backgrounds
 * @parent Graphics
 * 
 * @param Can Evolve
 * @desc Text that shows when you can evolve actor.
 * @type text
 * @default Requirements Met
 * 
 * @param Can Not Evolve
 * @desc Text that shows when you can't evolve actor.
 * @type text
 * @default Requirements Not Met
 * 
 * @param Will Evolve To
 * @desc Evolution target text.
 * @type text
 * @default Will Evolve To
 * 
 * @param Required Items Text
 * @desc Text for required items
 * @type text
 * @default Items Required
 * 
 * @param Hide if No Item
 * @desc Hide item text if no required items
 * @type boolean
 * @default false
 */


if(!SynrecMC)throw new Error("Core Plugin Missing.");
if(!isObject(SynrecMC))throw new Error("Bad Core Files.");
SynrecMC.EvolutionCore = {};
SynrecMC.EvolutionCore.Version = "1.1";

SynrecMC.EvolutionCore.Plugins = PluginManager.parameters('Synrec_MC_Evolution');
SynrecMC.EvolutionCore.AutoEvolve = eval(SynrecMC.EvolutionCore.Plugins['Evolve Healing']);
SynrecMC.EvolutionCore.EvolveReset = eval(SynrecMC.EvolutionCore.Plugins['Evolve Level Reset']);

SynrecMC.EvolutionCore.EvolveBackground = SynrecMC.EvolutionCore.Plugins['Evolve Scene Background'];
SynrecMC.EvolutionCore.evolveYes = SynrecMC.EvolutionCore.Plugins['Can Evolve'];
SynrecMC.EvolutionCore.evolveNo = SynrecMC.EvolutionCore.Plugins['Can Not Evolve'];
SynrecMC.EvolutionCore.evolveTarget = SynrecMC.EvolutionCore.Plugins['Will Evolve To'];
SynrecMC.EvolutionCore.itemReqTxt = SynrecMC.EvolutionCore.Plugins['Required Items Text'];
SynrecMC.EvolutionCore.itemReqHide = eval(SynrecMC.EvolutionCore.Plugins['Hide if No Item']);

Game_Actor.prototype.meetEvolutionRequirement = function(){
    const evolveLevel = eval(this.actor().meta.evolveLevel);
    const evolveItems = eval(this.actor().meta.evolveItems)
    if(!evolveLevel)return false;
    if(this._level < evolveLevel)return false;
    if(!this.hasEvolveItems(evolveItems))return false;
    return true;
}

Game_Actor.prototype.hasEvolveItems = function(arr){
    for(itm = 0; itm < arr.length; itm++){
        let itemId = arr[itm];
        let itemData = $dataItems[itemId];
        if(!$gameParty.hasItem(itemData))return false;
    }
    return true;
}

Game_Actor.prototype.evolve = function(){
    const targetActor = eval(this.actor().meta.evolveTarget);
    if(!targetActor)return false;
    const actor = $dataActors[targetActor];
    this._actorId = targetActor;
    this._name = actor.name;
    this._nickname = actor.nickname;
    this._profile = actor.profile;
    this._classId = actor.classId;
    if(SynrecMC.EvolutionCore.EvolveReset)this._level = actor.initialLevel;
    if(SynrecMC.EvolutionCore.AutoEvolve)this.recoverAll();
    this.initImages();
    this.refresh();
    $gameParty.refresh();
}

function Scene_Evolution(){
    this.initialize(...arguments);
}

Scene_Evolution.prototype = Object.create(Scene_Base.prototype);
Scene_Evolution.prototype.constructor = Scene_Evolution;

Scene_Evolution.prototype.update = function(){
    Scene_Base.prototype.update.call(this);
    this.updateButtonPush();
}

Scene_Evolution.prototype.updateButtonPush = function(){
    if(this._exButton && this._exButton.isPressed()){
        SoundManager.playBuzzer();
        this.popScene();
    }
}

Scene_Evolution.prototype.create = function(){
    Scene_Base.prototype.create.call(this);
    this.createBackground();
    this.createWindowLayer();
    this.createWindows();
    this.createButtons();
}

Scene_Evolution.prototype.createBackground = function(){
    const bitmapName = SynrecMC.EvolutionCore.EvolveBackground;
    this._background = new Sprite();
    if(bitmapName){
        this._background.bitmap = ImageManager.loadBackground(bitmapName);
    }else{
        this._backgroundFilter = new PIXI.filters.BlurFilter();
        this._background.filters = [this._backgroundFilter];
        this._background.opacity = 192;
    }
    this.addChild(this._background);
}

Scene_Evolution.prototype.createWindows = function(){
    this.createSceneTitle()
    this.createActorDataWindow();
    this.createRequirementsWindow();
    this.createTeamWindow();
}

Scene_Evolution.prototype.createSceneTitle = function(){
    const x = 0;
    const y = 0;
    const width = Graphics.width;
    const height = Graphics.height / 10;
    const rect = {x:x, y:y, width:width, height:height};
}

Scene_Evolution.prototype.createTeamWindow = function(){
    const width = Graphics.width;
    const height = Graphics.height / 3;
    const x = 0;
    const y = Graphics.height / 10;
    const rect = {x:x, y:y, width:width, height:height};
    this._teamWindow = new Window_TeamBoxEvolve(rect);
    this._teamWindow._evolveWindow = this._evolveWindow;
    this._teamWindow._dataWindow = this._actorDataWindow;
    this._teamWindow.activate();
    this._teamWindow.select(0);
    this._teamWindow.setHandler('ok', this.evolve.bind(this));
    this._teamWindow.setHandler('cancel', this.popScene.bind(this));
    this.addWindow(this._teamWindow);
}

Scene_Evolution.prototype.createActorDataWindow = function(){
    const y = Graphics.height / 10 + Graphics.height / 3;
    const width = (Graphics.width / 3) * 2;
    const height = Graphics.height - y;
    const x = Graphics.width - width;
    const rect = {x:x, y:y, width:width, height:height};
    this._actorDataWindow = new Window_ActorData(rect);
    this.addWindow(this._actorDataWindow);
}

Scene_Evolution.prototype.createRequirementsWindow = function(){
    const y = Graphics.height / 10 + Graphics.height / 3;
    const width = Graphics.width / 3;
    const height = Graphics.height - y;
    const x = 0;
    const rect = {x:x, y:y, width:width, height:height};
    this._evolveWindow = new Window_EvolveData(rect);
    this.addWindow(this._evolveWindow);
}

Scene_Evolution.prototype.createButtons = function(){
    if(ConfigManager.touchUI)this.createExBox();
}

Scene_Evolution.prototype.createExBox = function(){
    this._exButton = new Sprite_Button('cancel');
    this._exButton.x = 8;
    this._exButton.y = 8;
    this.addWindow(this._exButton);
}

Scene_Evolution.prototype.evolve = function(){
    const index = this._teamWindow.index();
    const actor = $gameParty._actors[index];
    if(!actor){
        SoundManager.playBuzzer();
        return;
    }
    if(actor.meetEvolutionRequirement()){
        actor.evolve();
    }else{
        SoundManager.playBuzzer();
    }
    this._teamWindow.activate();
    this._teamWindow.refresh();
}

function Window_TeamBoxEvolve(){
    this.initialize(...arguments);
}

Window_TeamBoxEvolve.prototype = Object.create(Window_TeamBox.prototype);
Window_TeamBoxEvolve.prototype.constructor = Window_TeamBoxEvolve;

Window_TeamBoxEvolve.prototype.cursorPagedown = function() {}

Window_TeamBoxEvolve.prototype.cursorPageup = function() {}

synrecWinTmBoxUpdate = Window_TeamBox.prototype.update;
Window_TeamBoxEvolve.prototype.update = function(){
    synrecWinTmBoxUpdate.call(this);
    this.updateEvolveWindow();
}

Window_TeamBoxEvolve.prototype.updateEvolveWindow = function(){
    const index = this.index();
    this._evolveWindow._data = $gameParty._actors[index];
}

function Window_EvolveData (){
    this.initialize(...arguments);
}

Window_EvolveData.prototype = Object.create(Window_Base.prototype);
Window_EvolveData.prototype.constructor = Window_EvolveData;

Window_EvolveData.prototype.update = function(){
    Window_Base.prototype.update.call(this);
    this.updateEvolveData();
}

Window_EvolveData.prototype.updateEvolveData = function(){
    this.refresh();
}

Window_EvolveData.prototype.drawData = function(){
    const halfHeight = this.contentsHeight() / 2 - this.lineHeight() /2;
    if(this._data){
        const currentData = eval(this._data.actor());
        const targetId = eval(currentData.meta.evolveTarget);
        const targetData = $dataActors[targetId];
        const currentLevel = this._data._level;
        const requiredLevel = eval(currentData.meta.evolveLevel);
        const requiredItemIds = eval(currentData.meta.evolveItems);
        const requiredItems = this.getItemArr(requiredItemIds);
        this.drawText(`Current ${TextManager.level} is ${currentLevel}`, 0, 0, this.contentsWidth(), 'center');
        if((requiredItems.length <= 0 && !SynrecMC.EvolutionCore.itemReqHide) ||
            (requiredItems.length > 0 && SynrecMC.EvolutionCore.itemReqHide) ||
            (requiredItems.length > 0 && !SynrecMC.EvolutionCore.itemReqHide))this.drawText(`${SynrecMC.EvolutionCore.itemReqTxt}: ${JSON.stringify(requiredItems)}`, 0, this.lineHeight(), this.contentsWidth())
        this.drawText(`Target ${TextManager.level} is ${requiredLevel}`, 0, this.contentsHeight() - this.lineHeight(), this.contentsWidth(), 'center');
        if(currentLevel >= requiredLevel && this.hasEvolveItems(requiredItemIds)){
            const targetName = targetData.name;
            this.changeTextColor(ColorManager.customColor('#aaaaff'));
            this.drawText(`${SynrecMC.EvolutionCore.evolveYes}`, 0, halfHeight, this.contentsWidth(), 'center');
            this.drawText(`${SynrecMC.EvolutionCore.evolveTarget} ${targetName}`, 0, halfHeight + this.lineHeight(), this.contentsWidth(), 'center');
        }else{
            this.changeTextColor(ColorManager.customColor('#ffaaaa'));
            this.drawText(`${SynrecMC.EvolutionCore.evolveNo}`, 0, halfHeight, this.contentsWidth(), 'center');
        }
    }else{
        this.drawText("No Information", 0, halfHeight, this.contentsWidth(), 'center');
    }
    this.resetTextColor();
}

Window_EvolveData.prototype.hasEvolveItems = function(arr){
    for(itm = 0; itm < arr.length; itm++){
        let itemId = arr[itm];
        let itemData = $dataItems[itemId];
        if(!$gameParty.hasItem(itemData))return false;
    }
    return true;
}

Window_EvolveData.prototype.getItemArr = function(arr){
    let newArr = [];
    if(isArray(arr)){
        for(tm = 0; tm < arr.length; tm++){
            let itemIdx = arr[tm];
            if($dataItems[itemIdx]){
                newArr.push($dataItems[itemIdx].name);
            }
        }
    }
    return newArr;
}

Window_EvolveData.prototype.refresh = function(){
    if(this.contents){
        this.contents.clear();
        this.drawData();
    }
}