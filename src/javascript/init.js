import {registry} from '@jahia/ui-extender';
import {DamSelector} from './DamSelector';
import svgJahiaLogo from './asset/jahiaLogo.svg';
import i18next from 'i18next';

import {registerDamSelectorActions} from './DamSelector/components/actions/registerPickerActions';

i18next.loadNamespaces('dam-selector');

export default function () {
    registry.add('callback', 'damChoiceListSelectorType', {
        targets: ['jahiaApp-init:20'],
        callback: () => {
            registry.add('selectorType', 'DamSelector', {cmp: DamSelector, supportMultiple: false});
            console.debug('%c DamSelector Editor Extensions  is activated', 'color: #3c8cba');
            // Add config for the jahia picker
            registry.add('damSelectorConfiguration', 'Picker', {
                types: ['jmix:image', 'jnt:file'],
                label: 'dam-selector:label.selectorConfig.label',
                description: 'dam-selector:label.selectorConfig.description',
                module: 'default',
                icon: svgJahiaLogo
            });

            registerDamSelectorActions(registry);
        }
    });
}
