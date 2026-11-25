const SITE = "https://connect.dijios.com";

export interface OrganizationNode {
  readonly "@type": "Organization";
  readonly "@id": string;
  readonly name: string;
  readonly url: string;
  readonly parentOrganization?: { readonly "@id": string };
}

export interface SoftwareNode {
  readonly "@type": "SoftwareApplication";
  readonly "@id": string;
  readonly name: string;
  readonly applicationCategory: "EducationalApplication";
  readonly operatingSystem: "Web, Windows, macOS, iOS, Android";
  readonly featureList: readonly string[];
  readonly provider: { readonly "@id": string };
  readonly url: string;
}

export interface FaqNode {
  readonly "@type": "FAQPage";
  readonly "@id": string;
  readonly mainEntity: readonly {
    readonly "@type": "Question";
    readonly name: string;
    readonly acceptedAnswer: { readonly "@type": "Answer"; readonly text: string };
  }[];
}

export interface HowToNode {
  readonly "@type": "HowTo";
  readonly "@id": string;
  readonly name: string;
  readonly step: readonly {
    readonly "@type": "HowToStep";
    readonly name: string;
    readonly text: string;
  }[];
}

export type SchemaNode = OrganizationNode | SoftwareNode | FaqNode | HowToNode;

export interface SchemaGraph {
  readonly "@context": "https://schema.org";
  readonly "@graph": readonly SchemaNode[];
}

export function buildSchemaGraph(): SchemaGraph {
  return {
    "@context": "https://schema.org",
    "@graph": [truncgil(), dijiosOrg(), software(), faqPage(), howTo()],
  };
}

function truncgil(): OrganizationNode {
  return {
    "@type": "Organization",
    "@id": `${SITE}/#truncgil`,
    name: "Trunçgil Teknoloji",
    url: "https://dijios.com",
  };
}

function dijiosOrg(): OrganizationNode {
  return {
    "@type": "Organization",
    "@id": `${SITE}/#dijios`,
    name: "dijiOS",
    url: "https://app.dijios.com",
    parentOrganization: { "@id": `${SITE}/#truncgil` },
  };
}

function software(): SoftwareNode {
  return {
    "@type": "SoftwareApplication",
    "@id": `${SITE}/#connect`,
    name: "dijiOS Connect",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web, Windows, macOS, iOS, Android",
    featureList: [
      "Self-hosted LiveKit SFU for 50+ teachers",
      "UUIDv7 institution isolation",
      "PDR_ACCESS_DENIED counseling wall",
      "Lesson-bell presence",
      "osGL Liquid Glass teacher shell",
    ],
    provider: { "@id": `${SITE}/#dijios` },
    url: SITE,
  };
}

function faqPage(): FaqNode {
  return {
    "@type": "FAQPage",
    "@id": `${SITE}/#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: "Öğrenci rehberlik notu zümre odasında görünür mü?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Hayır. PDR_ACCESS_DENIED duvarı notu yalnızca COUNSELOR rolüne açar.",
        },
      },
      {
        "@type": "Question",
        name: "Ses sunucusu okulun dışında mı barınır?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Hayır. LiveKit SFU self-hosted çalışır ve oda adı institution_id ile başlar.",
        },
      },
    ],
  };
}

function howTo(): HowToNode {
  return {
    "@type": "HowTo",
    "@id": `${SITE}/#howto-rooms`,
    name: "5 Dakikada Okul Zümre Odaları Nasıl Kurulur?",
    step: [
      {
        "@type": "HowToStep",
        name: "Kurumu seçin",
        text: "Kurucu, fen koleji takma adıyla oturum açar.",
      },
      {
        "@type": "HowToStep",
        name: "Zümre kanalını açın",
        text: "Matematik zümresi kanalı sesli oda türüyle oluşur.",
      },
      {
        "@type": "HowToStep",
        name: "Sahneye katılın",
        text: "Öğretmen dock üzerinden görüntülü zümre sahnesine girer.",
      },
    ],
  };
}
