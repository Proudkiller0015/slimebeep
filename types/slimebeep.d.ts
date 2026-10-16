/** Types that JSDoc in slimebeep.js can't express on its own. */

/** A value that can go into an `html` template: SafeHtml, text or numbers (escaped), lists of them, or nothing. */
type HtmlValue = { readonly value: string } | string | number | boolean | null | undefined | readonly HtmlValue[];
