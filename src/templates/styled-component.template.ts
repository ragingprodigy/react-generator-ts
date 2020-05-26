import { camelCase, pascalCase } from 'change-case';

export const getStyledComponentTemplate = (componentName: string, useSCSS: boolean) => {
  return `import React, { Component } from 'react';
import styles from './${componentName}.module.${useSCSS ? 'scss' : 'css'}';

export interface ${pascalCase(componentName)}Props {
  title: string;
}

export class ${pascalCase(componentName)} extends Component<${pascalCase(componentName)}Props> {
  render() {
    return <div className={styles.${componentName}}>
      {this.props.title}
    </div>;
  }
}

export default ${pascalCase(componentName)};
`;
};

export const getStyledFunctionalComponentTemplate = (componentName: string, useSCSS: boolean) => {
  return `import React from 'react';
import styles from './${componentName}.module.${useSCSS ? 'scss' : 'css'}';

export interface ${pascalCase(componentName)}Props {
  title: string;
}

export const ${camelCase(componentName)} = (props: ${pascalCase(componentName)}Props) => {
  return <div className={styles.${componentName}}>
    {props.title}
  </div>;
};

export default ${camelCase(componentName)};
`;
};