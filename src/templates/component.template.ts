import { camelCase, pascalCase } from 'change-case';

export const getComponentTemplate = (componentName: string) => {
  return `import React, { Component } from 'react';

export interface ${pascalCase(componentName)}Props {
  title: string;
}

export class ${pascalCase(componentName)} extends Component<${pascalCase(componentName)}Props> {
  render() {
    return <div>{this.props.title}</div>;
  }
}

export default ${pascalCase(componentName)};
`;
};

export const getFunctionalComponentTemplate = (componentName: string) => {
  return `import React from 'react';

export interface ${pascalCase(componentName)}Props {
  title: string;
}

export const ${camelCase(componentName)} = (props: ${pascalCase(componentName)}Props) => {
  return <div>{props.title}</div>;
};

export default ${camelCase(componentName)};
`;
};