/**
 * Option lists for the farmer registration form.
 *
 * These mirror the web admin app (src/modules/FarmManagement/utils/constants.ts
 * and nationalities.ts) so a farmer registered on mobile and on web ends up
 * with identical stored values. If the web lists change, change them here too.
 */

/**
 * ID types. The value IS the display text because that is what the web form
 * sends and stores (the backend field is free text, max 50 chars - it has no
 * fixed choices). Older mobile registrations saved "ghana_card" / "passport";
 * see normalizeIdType() in utils/farmerform.ts, which maps those back.
 */
export const ID_TYPE_OPTIONS = [
  { name: "Ghana Card", value: "Ghana Card" },
  { name: "NHIS", value: "NHIS" },
  { name: "Driver's License", value: "Driver's License" },
  { name: "Voter's Card", value: "Voter's Card" },
  { name: "Passport ID", value: "Passport ID" },
  { name: "No ID", value: "No ID" },
];

// Backend choices (MARITAL_STATUS_CHOICES / EDUCATION_LEVEL_CHOICES): the
// value is what is sent, the name is what is shown.
export const MARITAL_STATUS_OPTIONS = [
  { name: "Married", value: "married" },
  { name: "Single", value: "single" },
  { name: "Divorced", value: "divorced" },
  { name: "Widowed", value: "widowed" },
];

export const EDUCATION_LEVEL_OPTIONS = [
  { name: "No Formal Education", value: "no_formal_education" },
  { name: "Basic", value: "basic" },
  { name: "Secondary", value: "secondary" },
  { name: "Tertiary", value: "tertiary" },
  { name: "Vocational", value: "vocational" },
];

// The web form saves the *label* for this one (e.g. "Market Access"), so we do too.
export const AREAS_OF_NEED_OPTIONS = [
  { name: "Seeds", value: "Seeds" },
  { name: "Training", value: "Training" },
  { name: "Equipment", value: "Equipment" },
  { name: "Loans", value: "Loans" },
  { name: "Market Access", value: "Market Access" },
  { name: "Other", value: "Other" },
];

/**
 * Farmer types, mirroring the web admin app's utils/farmerTypes.ts.
 * Smallholder and Commercial farmers share one registration form; the only
 * differences are the `type` sent to the API, the label, and that commercial
 * farmers have no lead farmer. (Lead farmers have their own, different form
 * on the web and are not registered from this screen.)
 */
export type FarmerType = "smallholder" | "commercial";

export const FARMER_TYPE_OPTIONS: { name: string; value: FarmerType }[] = [
  { name: "Smallholder Farmer", value: "smallholder" },
  { name: "Commercial Farmer", value: "commercial" },
];

export const FARMER_TYPE_LABEL: Record<string, string> = {
  lead: "Lead Farmer",
  smallholder: "Smallholder Farmer",
  commercial: "Commercial Farmer",
};

/** The web country list currently only enables Ghana. */
export const COUNTRY_OPTIONS = ["Ghana"];
export const DEFAULT_COUNTRY = "Ghana";

/**
 * Backend key for "number of farms". It really is spelled "number_of_falls"
 * in the API (a typo on the backend) - the web app uses the same key. If the
 * backend renames it, change it here and nowhere else.
 */
export const NUMBER_OF_FARMS_API_KEY = "number_of_falls";

// Demonyms (e.g. "Ghanaian"); stored as free text. Neighbouring countries first.
export const NATIONALITY_OPTIONS: { name: string; value: string }[] = [
  {"name":"Ghanaian","value":"Ghanaian"},
  {"name":"Ivorian","value":"Ivorian"},
  {"name":"Togolese","value":"Togolese"},
  {"name":"Burkinabe","value":"Burkinabe"},
  {"name":"Nigerian","value":"Nigerian"},
  {"name":"Afghan","value":"Afghan"},
  {"name":"Albanian","value":"Albanian"},
  {"name":"Algerian","value":"Algerian"},
  {"name":"American","value":"American"},
  {"name":"Andorran","value":"Andorran"},
  {"name":"Angolan","value":"Angolan"},
  {"name":"Argentine","value":"Argentine"},
  {"name":"Armenian","value":"Armenian"},
  {"name":"Australian","value":"Australian"},
  {"name":"Austrian","value":"Austrian"},
  {"name":"Azerbaijani","value":"Azerbaijani"},
  {"name":"Bahamian","value":"Bahamian"},
  {"name":"Bahraini","value":"Bahraini"},
  {"name":"Bangladeshi","value":"Bangladeshi"},
  {"name":"Barbadian","value":"Barbadian"},
  {"name":"Basotho","value":"Basotho"},
  {"name":"Belarusian","value":"Belarusian"},
  {"name":"Belgian","value":"Belgian"},
  {"name":"Belizean","value":"Belizean"},
  {"name":"Beninese","value":"Beninese"},
  {"name":"Bhutanese","value":"Bhutanese"},
  {"name":"Bolivian","value":"Bolivian"},
  {"name":"Bosnian","value":"Bosnian"},
  {"name":"Botswanan","value":"Botswanan"},
  {"name":"Brazilian","value":"Brazilian"},
  {"name":"British","value":"British"},
  {"name":"Bruneian","value":"Bruneian"},
  {"name":"Bulgarian","value":"Bulgarian"},
  {"name":"Burundian","value":"Burundian"},
  {"name":"Cambodian","value":"Cambodian"},
  {"name":"Cameroonian","value":"Cameroonian"},
  {"name":"Canadian","value":"Canadian"},
  {"name":"Cape Verdean","value":"Cape Verdean"},
  {"name":"Central African","value":"Central African"},
  {"name":"Chadian","value":"Chadian"},
  {"name":"Chilean","value":"Chilean"},
  {"name":"Chinese","value":"Chinese"},
  {"name":"Colombian","value":"Colombian"},
  {"name":"Comorian","value":"Comorian"},
  {"name":"Congolese","value":"Congolese"},
  {"name":"Costa Rican","value":"Costa Rican"},
  {"name":"Croatian","value":"Croatian"},
  {"name":"Cuban","value":"Cuban"},
  {"name":"Cypriot","value":"Cypriot"},
  {"name":"Czech","value":"Czech"},
  {"name":"Danish","value":"Danish"},
  {"name":"Djiboutian","value":"Djiboutian"},
  {"name":"Dominican","value":"Dominican"},
  {"name":"Dutch","value":"Dutch"},
  {"name":"Ecuadorean","value":"Ecuadorean"},
  {"name":"Egyptian","value":"Egyptian"},
  {"name":"Emirati","value":"Emirati"},
  {"name":"Equatorial Guinean","value":"Equatorial Guinean"},
  {"name":"Eritrean","value":"Eritrean"},
  {"name":"Estonian","value":"Estonian"},
  {"name":"Eswatini","value":"Eswatini"},
  {"name":"Ethiopian","value":"Ethiopian"},
  {"name":"Fijian","value":"Fijian"},
  {"name":"Filipino","value":"Filipino"},
  {"name":"Finnish","value":"Finnish"},
  {"name":"French","value":"French"},
  {"name":"Gabonese","value":"Gabonese"},
  {"name":"Gambian","value":"Gambian"},
  {"name":"Georgian","value":"Georgian"},
  {"name":"German","value":"German"},
  {"name":"Greek","value":"Greek"},
  {"name":"Grenadian","value":"Grenadian"},
  {"name":"Guatemalan","value":"Guatemalan"},
  {"name":"Guinea-Bissauan","value":"Guinea-Bissauan"},
  {"name":"Guinean","value":"Guinean"},
  {"name":"Guyanese","value":"Guyanese"},
  {"name":"Haitian","value":"Haitian"},
  {"name":"Honduran","value":"Honduran"},
  {"name":"Hungarian","value":"Hungarian"},
  {"name":"Icelandic","value":"Icelandic"},
  {"name":"Indian","value":"Indian"},
  {"name":"Indonesian","value":"Indonesian"},
  {"name":"Iranian","value":"Iranian"},
  {"name":"Iraqi","value":"Iraqi"},
  {"name":"Irish","value":"Irish"},
  {"name":"Israeli","value":"Israeli"},
  {"name":"Italian","value":"Italian"},
  {"name":"Jamaican","value":"Jamaican"},
  {"name":"Japanese","value":"Japanese"},
  {"name":"Jordanian","value":"Jordanian"},
  {"name":"Kazakh","value":"Kazakh"},
  {"name":"Kenyan","value":"Kenyan"},
  {"name":"Kuwaiti","value":"Kuwaiti"},
  {"name":"Kyrgyz","value":"Kyrgyz"},
  {"name":"Laotian","value":"Laotian"},
  {"name":"Latvian","value":"Latvian"},
  {"name":"Lebanese","value":"Lebanese"},
  {"name":"Liberian","value":"Liberian"},
  {"name":"Libyan","value":"Libyan"},
  {"name":"Lithuanian","value":"Lithuanian"},
  {"name":"Luxembourgish","value":"Luxembourgish"},
  {"name":"Malagasy","value":"Malagasy"},
  {"name":"Malawian","value":"Malawian"},
  {"name":"Malaysian","value":"Malaysian"},
  {"name":"Maldivian","value":"Maldivian"},
  {"name":"Malian","value":"Malian"},
  {"name":"Maltese","value":"Maltese"},
  {"name":"Mauritanian","value":"Mauritanian"},
  {"name":"Mauritian","value":"Mauritian"},
  {"name":"Mexican","value":"Mexican"},
  {"name":"Moldovan","value":"Moldovan"},
  {"name":"Mongolian","value":"Mongolian"},
  {"name":"Montenegrin","value":"Montenegrin"},
  {"name":"Moroccan","value":"Moroccan"},
  {"name":"Mozambican","value":"Mozambican"},
  {"name":"Namibian","value":"Namibian"},
  {"name":"Nepalese","value":"Nepalese"},
  {"name":"New Zealander","value":"New Zealander"},
  {"name":"Nicaraguan","value":"Nicaraguan"},
  {"name":"Nigerien","value":"Nigerien"},
  {"name":"North Korean","value":"North Korean"},
  {"name":"Norwegian","value":"Norwegian"},
  {"name":"Omani","value":"Omani"},
  {"name":"Pakistani","value":"Pakistani"},
  {"name":"Palestinian","value":"Palestinian"},
  {"name":"Panamanian","value":"Panamanian"},
  {"name":"Papua New Guinean","value":"Papua New Guinean"},
  {"name":"Paraguayan","value":"Paraguayan"},
  {"name":"Peruvian","value":"Peruvian"},
  {"name":"Polish","value":"Polish"},
  {"name":"Portuguese","value":"Portuguese"},
  {"name":"Qatari","value":"Qatari"},
  {"name":"Romanian","value":"Romanian"},
  {"name":"Russian","value":"Russian"},
  {"name":"Rwandan","value":"Rwandan"},
  {"name":"Saudi","value":"Saudi"},
  {"name":"Senegalese","value":"Senegalese"},
  {"name":"Serbian","value":"Serbian"},
  {"name":"Seychellois","value":"Seychellois"},
  {"name":"Sierra Leonean","value":"Sierra Leonean"},
  {"name":"Singaporean","value":"Singaporean"},
  {"name":"Slovak","value":"Slovak"},
  {"name":"Slovenian","value":"Slovenian"},
  {"name":"Somali","value":"Somali"},
  {"name":"South African","value":"South African"},
  {"name":"South Korean","value":"South Korean"},
  {"name":"South Sudanese","value":"South Sudanese"},
  {"name":"Spanish","value":"Spanish"},
  {"name":"Sri Lankan","value":"Sri Lankan"},
  {"name":"Sudanese","value":"Sudanese"},
  {"name":"Surinamese","value":"Surinamese"},
  {"name":"Swedish","value":"Swedish"},
  {"name":"Swiss","value":"Swiss"},
  {"name":"Syrian","value":"Syrian"},
  {"name":"Taiwanese","value":"Taiwanese"},
  {"name":"Tajik","value":"Tajik"},
  {"name":"Tanzanian","value":"Tanzanian"},
  {"name":"Thai","value":"Thai"},
  {"name":"Trinidadian","value":"Trinidadian"},
  {"name":"Tunisian","value":"Tunisian"},
  {"name":"Turkish","value":"Turkish"},
  {"name":"Turkmen","value":"Turkmen"},
  {"name":"Ugandan","value":"Ugandan"},
  {"name":"Ukrainian","value":"Ukrainian"},
  {"name":"Uruguayan","value":"Uruguayan"},
  {"name":"Uzbek","value":"Uzbek"},
  {"name":"Venezuelan","value":"Venezuelan"},
  {"name":"Vietnamese","value":"Vietnamese"},
  {"name":"Yemeni","value":"Yemeni"},
  {"name":"Zambian","value":"Zambian"},
  {"name":"Zimbabwean","value":"Zimbabwean"},
];
