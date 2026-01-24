/**
 * SEO Keyword Tracker Agent
 * 
 * Uses Firecrawl to:
 * - Monitor competitor websites for content changes
 * - Track keyword rankings and suggest improvements
 * - Generate SEO recommendations
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SEORequest {
  action: 'analyze-competitor' | 'suggest-keywords' | 'audit-page';
  url?: string;
  keywords?: string[];
  industry?: string;
}

interface SEOResult {
  success: boolean;
  action: string;
  data: any;
  recommendations: string[];
  timestamp: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, url, keywords, industry = 'fintech' }: SEORequest = await req.json();
    
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      throw new Error("FIRECRAWL_API_KEY not configured");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    let result: SEOResult;

    switch (action) {
      case 'analyze-competitor': {
        if (!url) throw new Error("URL required for competitor analysis");
        
        console.log(`Analyzing competitor: ${url}`);
        
        // Scrape competitor page
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            formats: ['markdown', 'branding'],
            onlyMainContent: true,
          }),
        });

        if (!scrapeResponse.ok) {
          throw new Error(`Firecrawl scrape failed: ${scrapeResponse.status}`);
        }

        const scrapeData = await scrapeResponse.json();
        const content = scrapeData.data?.markdown || scrapeData.markdown || '';
        const branding = scrapeData.data?.branding || scrapeData.branding || {};

        // Analyze with AI
        const analysis = await analyzeWithAI(
          LOVABLE_API_KEY,
          `Analyze this competitor website content for SEO opportunities. 
           Identify: key messaging, target keywords, unique value propositions, 
           content gaps we could exploit, and their SEO strengths/weaknesses.
           
           Content: ${content.slice(0, 5000)}
           
           Branding info: ${JSON.stringify(branding)}`,
          'competitor_analysis'
        );

        result = {
          success: true,
          action,
          data: {
            url,
            contentLength: content.length,
            branding,
            analysis
          },
          recommendations: analysis.recommendations || [],
          timestamp: new Date().toISOString()
        };
        break;
      }

      case 'suggest-keywords': {
        console.log(`Generating keyword suggestions for: ${industry}`);
        
        // Search for industry trends
        const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `${industry} trading analysis platform features 2024`,
            limit: 10,
            lang: 'en',
          }),
        });

        const searchData = await searchResponse.json();
        const searchResults = searchData.data || [];

        // Analyze search results for keyword opportunities
        const keywordAnalysis = await analyzeWithAI(
          LOVABLE_API_KEY,
          `Based on these search results about ${industry} trading platforms, 
           suggest 20 high-value SEO keywords for OutputLens (an AI-powered trade scenario analysis platform).
           
           Categorize keywords by:
           1. High intent (ready to buy/sign up)
           2. Informational (learning about concepts)
           3. Comparison (vs competitors)
           4. Long-tail opportunities
           
           Search results summary: ${JSON.stringify(searchResults.slice(0, 5).map((r: any) => ({
             title: r.title,
             description: r.description
           })))}`,
          'keyword_suggestions'
        );

        result = {
          success: true,
          action,
          data: {
            industry,
            searchResultsAnalyzed: searchResults.length,
            keywords: keywordAnalysis.keywords || []
          },
          recommendations: keywordAnalysis.recommendations || [],
          timestamp: new Date().toISOString()
        };
        break;
      }

      case 'audit-page': {
        if (!url) throw new Error("URL required for page audit");
        
        console.log(`Auditing page: ${url}`);
        
        // Scrape the page
        const auditResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url,
            formats: ['markdown', 'html', 'links'],
            onlyMainContent: false,
          }),
        });

        const auditData = await auditResponse.json();
        const pageContent = auditData.data || auditData;

        // Perform SEO audit with AI
        const audit = await analyzeWithAI(
          LOVABLE_API_KEY,
          `Perform a comprehensive SEO audit on this page. Check for:
           1. Title tag optimization
           2. Meta description quality
           3. Header hierarchy (H1, H2, H3)
           4. Keyword density and placement
           5. Internal/external linking
           6. Content quality and length
           7. Call-to-action effectiveness
           8. Mobile optimization signals
           
           Provide specific, actionable recommendations.
           
           Page metadata: ${JSON.stringify(pageContent.metadata || {})}
           Content preview: ${(pageContent.markdown || '').slice(0, 3000)}
           Links found: ${(pageContent.links || []).length}`,
          'seo_audit'
        );

        result = {
          success: true,
          action,
          data: {
            url,
            metadata: pageContent.metadata,
            linksCount: (pageContent.links || []).length,
            contentLength: (pageContent.markdown || '').length,
            audit
          },
          recommendations: audit.recommendations || [],
          timestamp: new Date().toISOString()
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`SEO analysis complete: ${action}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("SEO tracker error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function analyzeWithAI(apiKey: string, prompt: string, taskType: string): Promise<any> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { 
          role: "system", 
          content: `You are an expert SEO analyst for OutputLens, an AI-powered trade scenario analysis platform. 
                    Provide actionable, specific recommendations that will improve search visibility and conversions.
                    Focus on fintech, trading, and investment-related keywords.`
        },
        { role: "user", content: prompt }
      ],
      tools: [{
        type: "function",
        function: {
          name: "seo_analysis",
          description: "Structured SEO analysis output",
          parameters: {
            type: "object",
            properties: {
              summary: { type: "string", description: "Brief summary of findings" },
              keywords: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    keyword: { type: "string" },
                    intent: { type: "string", enum: ["high", "informational", "comparison", "long-tail"] },
                    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                    priority: { type: "number", minimum: 1, maximum: 10 }
                  }
                }
              },
              recommendations: {
                type: "array",
                items: { type: "string" },
                description: "Specific actionable recommendations"
              },
              score: { type: "number", minimum: 0, maximum: 100, description: "SEO score if auditing" }
            },
            required: ["summary", "recommendations"]
          }
        }
      }],
      tool_choice: { type: "function", function: { name: "seo_analysis" } }
    }),
  });

  if (!response.ok) {
    throw new Error(`AI analysis failed: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (!toolCall?.function?.arguments) {
    return { summary: "Analysis incomplete", recommendations: [] };
  }

  return JSON.parse(toolCall.function.arguments);
}
