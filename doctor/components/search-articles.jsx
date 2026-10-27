import React from "react";
import SearchBar from "@/components/ui/SearchBar";

/**
 * Barre de recherche des articles — délègue au SearchBar du kit UI.
 * L'écran parent passe `text` / `onChange` et filtre le contenu.
 */
const SearchArticles = ({ text = "", onChange, ...props }) => (
  <SearchBar
    value={text}
    onChangeText={onChange}
    containerStyle={{ marginVertical: 16 }}
    {...props}
  />
);

export default SearchArticles;
