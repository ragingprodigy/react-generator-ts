export const getStyledComponentTemplate = (componentName: string, useSCSS: boolean) => {
  return `import React, { Component } from 'react';
import styles from './${componentName}.module.${useSCSS ? 'scss' : 'css'}';

export class ${componentName} extends Component {
  render() {
    return <div className={styles.${componentName}}></div>;
  }
}

export default ${componentName};
`;
};
