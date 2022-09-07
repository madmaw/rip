const haxShortenMethods = <F, T extends F>(o: F, variableName: string): T => {
  const mapped = new Map<string, string>();
  for(const k in o) {
    const shortened = k.replace(/(^..)[a-z]*([A-Z]?)?[a-z]*([A-Z]?)?[a-z]*([A-Z]?)?[a-z]*(.+)$/, '$1$2$3$4$5');
    if (FLAG_DEBUG_SHORTENED_METHODS) {
      if (shortened != k) {
        if (o[shortened]) {
          console.log(`//${shortened} from ${k} already exists: ${mapped.get(shortened)}`);
        } else {
          mapped.set(shortened, k);
        }
      }  
    }
    o[shortened] = o[k];
  }
  if (FLAG_DEBUG_SHORTENED_METHODS) {  
    // also generate the replacements
    const gruntMappings = [...mapped.entries()].map(([k, v]) => {
      return `{ from: "${variableName}.${v}(", to: "${variableName}['${k}'](" }, `
    }); 
    for( let i=0; i<gruntMappings.length; i += 100) {
      console.log(gruntMappings.slice(i, i + 100).join(''));
    }
  }
  return o as any;
};
