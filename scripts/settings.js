
function default_setting(name)
{
    Core.settings.defaults(name, true);
    return name;
}

Events.on(EventType.ClientLoadEvent, 
cons(e => {
    Log.info("Settings load")
    
    Vars.ui.settings.graphics.checkPref(default_setting("seethrough"), Core.settings.getBool("seethrough"));
}));

