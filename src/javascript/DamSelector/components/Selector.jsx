import React from 'react'
import {useTranslation} from 'react-i18next';
import {Dropdown, toIconComponent} from "@jahia/moonstone";
import {PickerComponent} from "./PickerComponent";
import {withStyles} from '@material-ui/core';
import clsx from 'clsx';

const styles = () => ({
    selector: {
        marginBottom:  'var(--spacing-nano)'
    }
});

//Create a dropdown list with by default "jahia", then get from the config the list of DAM to enable <name><selectorType>
const SelectorCmp = ({classes,...props}) => {
    const {damSelectorConfigs, valueChoiceListConfig, field, id, value, editorContext, inputContext} = props
    const {t} = useTranslation();

    const [selectedChoiceListConfig,setSelectedChoiceListConfig] = React.useState(valueChoiceListConfig);
    const [resetValue,setResetValue] = React.useState(false);

    const {readOnly, label,/* iconName,*/ dropdownData} = React.useMemo(() => ({
        readOnly: field.readOnly /*|| field.valueConstraints.length === 0*/,
        label: selectedChoiceListConfig?.label || 'Select a provider',
        // iconName: getIconOfField(field, value) || '',
        dropdownData: damSelectorConfigs.length > 0 ? damSelectorConfigs.map( ({key:picker,label,icon},index) => {
            // const image = item.properties?.find(property => property.name === 'image')?.value;
            // const description = item.properties?.find(property => property.name === 'description')?.value;
            const iconStart = icon;
            // const iconEnd = item.properties?.find(property => property.name === 'iconEnd')?.value;
            return {
                label,
                value: picker,
                // description: t(description),
                iconStart: iconStart && toIconComponent(iconStart),
                // iconEnd: iconEnd && toIconComponent(iconEnd),
                // image: image && <img src={image} alt={item.displayValue}/>,
                attributes: {
                    'data-value': picker
                }
            };
        }) : [{label: '', value: ''}]
    }), [t, field, selectedChoiceListConfig]);


    return (
        <>
            <div className={clsx("flexFluid flexRow alignCenter",classes.selector)}>
                <Dropdown
                    className="flexFluid"
                    name={field.name}
                    id={'select-' + id}
                    // imageSize="small"
                    isDisabled={readOnly}
                    maxWidth="100%"
                    variant="outlined"
                    size="medium"
                    data={dropdownData}
                    label={label}
                    value={selectedChoiceListConfig?.key}
                    // icon={iconName && toIconComponent(iconName)}
                    hasSearch={dropdownData && dropdownData.length >= 5}
                    searchEmptyText={t('content-editor:label.contentEditor.global.noResult')}
                    onChange={(evt, item) => {
                        if (item.value !== selectedChoiceListConfig?.key) {
                            // console.log(item.value);
                            const changedChoiceListConfig = damSelectorConfigs.find( ({key:picker}) => picker === item.value);
                            setSelectedChoiceListConfig(changedChoiceListConfig);
                            setResetValue(valueChoiceListConfig.key === item.value ? false : true);
                        }
                    }}
                    // onBlur={onBlur}
                />
                {/*{inputContext.displayActions && (*/}
                {/*    <DisplayAction actionKey="content-editor/field/Choicelist"*/}
                {/*                   field={field}*/}
                {/*                   inputContext={inputContext}*/}
                {/*                   // render={ButtonRenderer}*/}
                {/*    />*/}
                {/*)}*/}
            </div>
            <div className="flexFluid flexRow alignCenter">
                <PickerComponent choiceListConfig={selectedChoiceListConfig} resetValue={resetValue} {...props}/>
            </div>
        </>
    )
}
export const Selector = withStyles(styles)(SelectorCmp);
