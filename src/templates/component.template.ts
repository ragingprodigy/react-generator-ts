export const getComponentTemplate = (componentName: string) => {
  return `import React, { Component } from 'react';

export interface ${componentName}Props {
  title: string;
}

export class ${componentName} extends Component<${componentName}Props> {
  render() {
    return <div>{this.props.title}</div>;
  }
}

export default ${componentName};
`;
};

export const getFunctionalComponentTemplate = (componentName: string) => {
  return `import React from 'react';

export interface ${componentName}Props {
  title: string;
}

export const ${componentName} = (props: ${componentName}Props) => {
  return <div>{props.title}</div>;
};

export default ${componentName};
`;
};