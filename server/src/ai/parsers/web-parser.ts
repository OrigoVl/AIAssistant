import axios from "axios";
import { load } from "cheerio";
import { Document } from "../../entities/document.entity";

export async function parseVueDocumentation(): Promise<Partial<Document>[]> {
  const url = "https://vuejs.org/api/";
  const { data } = await axios.get(url);
  const $ = load(data);

  const sections: Partial<Document>[] = [];

  $("h2").each((i, el) => {
    const title = $(el).text().trim();
    let content = "";

    let next = $(el).next();
    while (next.length && !next.is("h2")) {
      content += next.text() + "\n";
      next = next.next();
    }

    sections.push({
      title,
      content: content.substring(0, 5000),
      source: url + "#" + $(el).attr("id"),
      type: "documentation",
      technology: "vue",
    });
  });

  return sections;
}

// Аналогічні парсери для інших технологій:
// parseNodeDocumentation, parseTsDocumentation, parseGrapesDocumentation
