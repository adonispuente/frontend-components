import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Wizard, Button, Text } from '@patternfly/react-core';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory, Link } from 'react-router-dom';

import FinishedStep from './steps/FinishedStep';
import ErroredStep from './steps/ErroredStep';
import LoadingStep from './steps/LoadingStep';
import TimeoutStep from './steps/TimeoutStep';

import { WIZARD_DESCRIPTION, WIZARD_TITLE } from '../utilities/stringConstants';
import { getSourcesApi } from '../api';

const FinalWizard = ({
    afterSubmit,
    afterError,
    isFinished,
    isErrored,
    onRetry,
    successfulMessage,
    hideSourcesButton,
    returnButtonTitle,
    reset,
    createdSource = {},
    tryAgain
}) =>{
    const [ isDeletingSource, setIsDeleting ] = useState();
    const [ isAfterDeletion, setDeleted ] = useState();

    const intl = useIntl();
    const { push } = useHistory();

    const removeSource = () => {
        setIsDeleting(true);

        return getSourcesApi().removeSource(createdSource.id).then(() => setDeleted(true)).catch(() => setIsDeleting(false));
    };

    let step;
    if (isAfterDeletion) {
        step = <FinishedStep
            onClose={ afterSubmit }
            title={ intl.formatMessage({ id: 'wizard.removeSourceSuccessTitle', defaultMessage: 'Removing successful' }) }
            successfulMessage={ intl.formatMessage({ id: 'wizard.removeSourceSuccessDescription', defaultMessage: 'Source was successfully removed.' }) }
            hideSourcesButton={ hideSourcesButton }
            returnButtonTitle={ returnButtonTitle }
            secondaryActions={<Button variant="link" onClick={ reset }><FormattedMessage id="wizard.addAnotherSource" defaultMessage="Add another source"/></Button>}
        />;
    } else if (isDeletingSource) {
        step = <LoadingStep
            customText={<FormattedMessage id="wizard.removingSource" defaultMessage="Removing source"/>}
        />;
    } else if (isFinished) {
        if (createdSource.applications[0]?.availability_status === 'available') {
            step = <FinishedStep
                onClose={ afterSubmit }
                successfulMessage={ successfulMessage }
                hideSourcesButton={ hideSourcesButton }
                returnButtonTitle={ returnButtonTitle }
                secondaryActions={<Button variant="link" onClick={ reset }><FormattedMessage id="wizard.addAnotherSource" defaultMessage="Add another source"/></Button>}
            />;
        } else if (createdSource.applications[0]?.availability_status === 'unavailable') {
            step = <ErroredStep
                onRetry={ onRetry }
                onClose={ afterSubmit }
                secondaryActions={<Button variant="link" onClick={ removeSource }>
                    {intl.formatMessage({ id: 'wizard.removeSource', defaultMessage: 'Remove source' })}
                </Button>}
                Component={() => (
                    <Link to={`/sources/edit/${createdSource.id}`}>
                        <Button variant='primary'>
                            { intl.formatMessage({ id: 'wizard.editSource', defaultMessage: 'Edit source' })}
                        </Button>
                    </Link>
                )}
                message={createdSource.applications[0]?.availability_status_error || intl.formatMessage({ id: 'wizard.unknownError', defaultMessage: 'Unknown error' })}
                title={intl.formatMessage({ id: 'wizard.configurationUnsuccessful', defaultMessage: 'Configuration unsuccessful' })}
            />;
        } else if (createdSource.applications[0]) {
            step = <TimeoutStep
                onClose={ afterSubmit }
                returnButtonTitle={ returnButtonTitle }
                secondaryActions={<Button variant="link" onClick={ reset }><FormattedMessage id="wizard.addAnotherSource" defaultMessage="Add another source"/></Button>}
            />;
        } else {
            step = <FinishedStep
                onClose={ afterSubmit }
                successfulMessage={ successfulMessage }
                hideSourcesButton={ hideSourcesButton }
                returnButtonTitle={ returnButtonTitle }
                secondaryActions={<Button variant="link" onClick={ reset }><FormattedMessage id="wizard.addAnotherSource" defaultMessage="Add another source"/></Button>}
            />;
        }
    } else if (isErrored) {
        step = <ErroredStep
            onClose={ afterError }
            primaryAction={tryAgain}
        />;
    } else {
        step = <LoadingStep
            customText={<FormattedMessage id="wizard.loadingText" defaultMessage="Validating source credentials"/>}
            onClose={afterError}
            cancelTitle={intl.formatMessage({ id: 'wizard.close', defaultMessage: 'Close' })}
        />;
    }

    return (
        <Wizard
            isOpen={ true }
            onClose={ isFinished ? afterSubmit : afterError }
            title={WIZARD_TITLE}
            description={WIZARD_DESCRIPTION}
            steps={ [{
                name: 'Finish',
                component: step,
                isFinishedStep: true
            }] }
        />
    );};

FinalWizard.propTypes = {
    afterSubmit: PropTypes.func.isRequired,
    afterError: PropTypes.func.isRequired,
    onRetry: PropTypes.func.isRequired,
    isFinished: PropTypes.bool.isRequired,
    isErrored: PropTypes.bool.isRequired,
    successfulMessage: PropTypes.node.isRequired,
    hideSourcesButton: PropTypes.bool,
    returnButtonTitle: PropTypes.node.isRequired,
    errorMessage: PropTypes.node,
    reset: PropTypes.func,
    createdSource: PropTypes.object,
    tryAgain: PropTypes.func
};

export default FinalWizard;
