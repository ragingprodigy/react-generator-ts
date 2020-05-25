export const getStyledComponentTemplate = (componentName: string, useSCSS: boolean) => {
  return `import React, { Component } from 'react';
import styles from './${componentName}.module.${useSCSS ? 'scss' : 'css'}';

export interface ${componentName}Props {
  title: string;
}

export class ${componentName} extends Component<${componentName}Props> {
  render() {
    return <div className={styles.${componentName}}>
      {this.props.title}
    </div>;
  }
}

export default ${componentName};
`;
};

export const getStyledFunctionalComponentTemplate = (componentName: string, useSCSS: boolean) => {
  return `import React from 'react';
import styles from './${componentName}.module.${useSCSS ? 'scss' : 'css'}';

export interface ${componentName}Props {
  title: string;
}

export const ${componentName} = (props: ${componentName}Props) => {
  return <div className={styles.${componentName}}>
    {props.title}
  </div>;
};

export default ${componentName};
`;
};