import React from 'react';

const Navigation = ({ instructions, currentStep }) => {
    return (
        <div>
            <h2>Navigation</h2>
            <ul>
                {instructions.map((step, index) => (
                    <li
                        key={index}
                        style={{ fontWeight: index === currentStep ? 'bold' : 'normal' }}
                        dangerouslySetInnerHTML={{ __html: step.instruction }}
                    />
                ))}
            </ul>
        </div>
    );
};

export default Navigation;