const shortenMethods = <F, T extends F>(o: F, variableName: string): T => {
  // let dts = '';
  const mapped = new Map<string, string>();
  for(const k in o) {
    const shortened = k.replace(/(^..)[a-z]*([A-Z]?)?[a-z]*([A-Z]?)?[a-z]*([A-Z]?)?[a-z]*(.+)$/, '$1$2$3$4$5');
    if (FLAG_DEBUG_SHORTENED_METHODS) {
      if (shortened != k) {
        if (o[shortened]) {
          console.log(`//${shortened} from ${k} already exists: ${mapped.get(shortened)}`);
        } else {
          mapped.set(shortened, k);
          // dts += `${shortened}: PropType<${o.constructor?.name || 'object'}, '${k}'>;\n`;
        }
      }  
    }
    o[shortened] = o[k];
  }
  if (FLAG_DEBUG_SHORTENED_METHODS) {  
    // console.log(dts);

    // also generate the replacements
    console.log([...mapped.entries()].map(([k, v]) => {
      return ` }, { from: "${variableName}.${v}(", to: "${variableName}['${k}']("`
    }).join(''));  
  }
  return o as any;
};
