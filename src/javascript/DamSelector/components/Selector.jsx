import React from 'react';
import {useTranslation} from 'react-i18next';
import {Dropdown, toIconComponent} from '@jahia/moonstone';
import {PickerComponent} from './PickerComponent';
import {withStyles} from '@material-ui/core';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {FieldPropTypes} from '../../editor.proptypes';
import {DisplayAction} from '@jahia/ui-extender';
import {getButtonRenderer} from '../../utils';
const ButtonRenderer = getButtonRenderer({labelStyle: 'none', defaultButtonProps: {variant: 'ghost'}});

const styles = () => ({
    selector: {
        marginBottom: 'var(--spacing-nano)'
    }
});

// Create a dropdown list with by default "jahia", then get from the config the list of DAM to enable <name><selectorType>
const SelectorCmp = ({classes, ...props}) => {
    const {damSelectorConfigs, valueChoiceListConfig, field, id, inputContext, value, onChange} = props;
    const {t} = useTranslation();

    const [selectedChoiceListConfig, setSelectedChoiceListConfig] = React.useState(valueChoiceListConfig);

    const {readOnly, label, iconName, dropdownData} = React.useMemo(() => ({
        readOnly: field.readOnly /* || field.valueConstraints.length === 0 */,
        label: t(selectedChoiceListConfig?.label || 'dam-selector:label.dropDown.emptyLabel'),
        iconName: selectedChoiceListConfig?.icon || '',
        dropdownData: damSelectorConfigs.length > 0 ? damSelectorConfigs.map(({key: picker, label, icon, description}) => {
            // Const image = item.properties?.find(property => property.name === 'image')?.value;
            // const description = item.properties?.find(property => property.name === 'description')?.value;
            const iconStart = icon;
            // Const iconEnd = item.properties?.find(property => property.name === 'iconEnd')?.value;
            return {
                label: t(label),
                value: picker,
                description: t(description),
                iconStart: iconStart && toIconComponent(iconStart),
                // IconEnd: iconEnd && toIconComponent(iconEnd),
                // image: image && <img src={image} alt={item.displayValue}/>,
                attributes: {
                    'data-value': picker
                }
            };
        }) : [{label: '', value: ''}]
    }), [t, field, selectedChoiceListConfig, damSelectorConfigs]);

    return (
        <>
            <div className={clsx('flexFluid flexRow alignCenter', classes.selector)}>
                <Dropdown
                    className="flexFluid"
                    name={field.name}
                    id={'select-' + id}
                    // ImageSize="small"
                    isDisabled={readOnly}
                    maxWidth="100%"
                    variant="outlined"
                    size="medium"
                    data={dropdownData}
                    label={label}
                    value={selectedChoiceListConfig?.key}
                    icon={iconName && toIconComponent(iconName)}
                    hasSearch={dropdownData && dropdownData.length >= 5}
                    searchEmptyText={t('content-editor:label.contentEditor.global.noResult')}
                    onChange={(evt, item) => {
                        if (item.value !== selectedChoiceListConfig?.key) {
                            const changedChoiceListConfig = damSelectorConfigs.find(({key: picker}) => picker === item.value);

                            if (changedChoiceListConfig.value) {
                                onChange(changedChoiceListConfig.value);
                            }
                                setSelectedChoiceListConfig(changedChoiceListConfig);
                        }
                    }}
                    // OnBlur={onBlur}
                />
                {inputContext.displayActions && value && (
                <DisplayAction actionKey="content-editor/field/DamSelector"
                               value={value}
                               field={field}
                               inputContext={inputContext}
                               render={ButtonRenderer}
                        />
                )}
            </div>
            <div className="flexFluid flexRow alignCenter">
                <PickerComponent {...{
                    ...props,
                    choiceListConfig: selectedChoiceListConfig
                }}/>
            </div>
        </>
    );
};

SelectorCmp.propTypes = {
    classes: PropTypes.object.isRequired,
    field: FieldPropTypes.isRequired,
    id: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    inputContext: PropTypes.object.isRequired,
    damSelectorConfigs: PropTypes.array.isRequired,
    valueChoiceListConfig: PropTypes.array.isRequired
};

export const Selector = withStyles(styles)(SelectorCmp);
