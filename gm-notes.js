class GMNote extends FormApplication {

    constructor(object, options) {
        super(object, options);

        this.entity.apps[this.appId] = this;
    }

    get entity() {
        return this.object;
    }

    get showExtraButtons() {
        return (game.dnd5e && this.entity.constructor.name !== 'RollTable');
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "modules/gm-notes/templates.html";
        options.width = '600';
        options.height = '700';
        options.classes = ['gm-notes', 'sheet'];
        options.title = game.i18n.localize('GMNote.label');
        options.resizable = true;
        options.editable = true;
        return options;
    }

    getData() {
        const data = super.getData();

        data.notes = this.entity.getFlag('gm-notes', 'notes');
        data.flags = this.entity.data.flags;
        data.owner = game.user.id;
        data.isGM = game.user.isGM;
        data.showExtraButtons = this.showExtraButtons;

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('.moveToNote').click(ev => this._moveToNotes());
        html.find('.moveToDescription').click(ev => this._moveToDescription());
    }
    
    async _updateObject(event, formData) {
        if (game.user.isGM) {
            await this.entity.setFlag('gm-notes', 'notes', formData["flags.gm-notes.notes"]);
            this.render();
        } else {
            ui.notifications.error("You have to be GM to edit GM Notes.");
        }
    }

    static _initEntityHook(app, html, data) {
        if (game.user.isGM) {
            let labelTxt = '';
            let title = game.i18n.localize('GMNote.label'); 
            if (game.settings.get('gm-notes', 'showLabel')) {
                labelTxt = ' ' + title;
            }
            let notes = app.entity.getFlag('gm-notes', 'notes');
            let openBtn = $(`<a class="open-gm-note" title="${title}"><i class="fas fa-clipboard${notes ? '-check':''}"></i>${labelTxt}</a>`);
            if (game.settings.get("gm-notes", 'makeColoured') === true) {
                openBtn = $(`<a class="open-gm-note" title="${title}"><i class="fas fa-clipboard${notes ? '-check" style="color:red"':''}"></i>${labelTxt}</a>`);
            }
            openBtn.click(ev => {
                let noteApp = null;
                for (let key in app.entity.apps) {
                    let obj = app.entity.apps[key];
                    if (obj instanceof GMNote) {
                        noteApp = obj;
                        break;
                    }
                }
                if (!noteApp) noteApp = new GMNote(app.entity, { submitOnClose: true, closeOnSubmit: false, submitOnUnfocus: true });
                noteApp.render(true);
            });
            html.closest('.app').find('.open-gm-note').remove();
            let titleElement = html.closest('.app').find('.window-title');
            openBtn.insertAfter(titleElement);
        }
    }
    
    async _moveToNotes() {
        if (game.dnd5e) {
            let descPath = '';
            switch (this.entity.constructor.name) {
                case 'Actor5e': descPath = 'data.details.biography.value'; break;
                case 'Item5e': descPath = 'data.description.value'; break;
                case 'JournalEntry': descPath = 'content'; break;
            }
            let description = getProperty(this.entity, 'data.'+descPath);
            let notes = getProperty(this.entity, 'data.flags.gm-notes.notes');

            if (notes === undefined) notes = '';
            if (description === undefined) description = '';

            let obj = {};
            obj[descPath] = '';
            obj['flags.gm-notes.notes'] = notes + description;

            await this.entity.update(obj);
            this.render();
        }
    }

    async _moveToDescription() {
        if (game.dnd5e) {
            let descPath = '';
            switch (this.entity.constructor.name) {
                case 'Actor5e': descPath = 'data.details.biography.value'; break;
                case 'Item5e': descPath = 'data.description.value'; break;
                case 'JournalEntry': descPath = 'content'; break;
            }
            let description = getProperty(this.entity, 'data.' + descPath);
            let notes = getProperty(this.entity, 'data.flags.gm-notes.notes');

            if (notes === undefined) notes = '';
            if (description === undefined) description = '';

            let obj = {};
            obj[descPath] = description + notes;
            obj['flags.gm-notes.notes'] = '';

            await this.entity.update(obj);
            this.render();
        }
    }
}
Hooks.on('init', () => {
    game.settings.register("gm-notes", 'showLabel', {
        name: game.i18n.localize('GMNote.setting'),
        hint: game.i18n.localize('GMNote.settingHint'),
        scope: "world",
        config: true,
        default: true,
        type: Boolean
    });
    game.settings.register("gm-notes", 'makeColoured', {
        name: game.i18n.localize('GMNote.makeColoured'),
        hint: game.i18n.localize('GMNote.makeColouredHint'),
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });
});

Hooks.on('renderActorSheet', (app, html, data) => {
    GMNote._initEntityHook(app, html, data);
});
Hooks.on('renderItemSheet', (app, html, data) => {
    GMNote._initEntityHook(app, html, data);
});
Hooks.on('renderJournalSheet', (app, html, data) => {
    GMNote._initEntityHook(app, html, data);
});
Hooks.on('renderRollTableConfig', (app, html, data) => {
    GMNote._initEntityHook(app, html, data);
});
