export const getComponentTemplate = (componentName: string) => {
  return `import React, { Component } from 'react';

export class ${componentName} extends Component {
  render() {
    return <div></div>;
  }
}

export default ${componentName};
`;
};
