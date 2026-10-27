import React from "react";
import SearchBar from "@/components/ui/SearchBar";

/**
 * Barre de recherche du forum — délègue tout au SearchBar du kit UI.
 * Composant contrôlé : l'écran parent possède le texte et filtre les posts.
 */
const SearchForum = ({ value, onChangeText, ...props }) => (
  <SearchBar value={value} onChangeText={onChangeText} {...props} />
);

export default SearchForum;
