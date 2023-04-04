import {registry} from '@jahia/ui-extender';
import {DamSelector} from './DamSelector';
import svgJahiaLogo from './asset/jahiaLogo.svg'
export default function () {
    registry.add('callback', 'damChoiceListSelectorType',{
        targets:['jahiaApp-init:20'],
        callback: () => {
            registry.add('selectorType','DamSelector', {cmp: DamSelector, supportMultiple:false});
            console.debug('%c DamSelector Editor Extensions  is activated', 'color: #3c8cba');
            //add config for the jahia picker
            registry.add('damSelectorConfiguration','Picker',{
                types: ['jmix:image','jnt:file'],
                label:'Jahia',
                module:'default',
                icon: svgJahiaLogo
            });
        }
    })
}
