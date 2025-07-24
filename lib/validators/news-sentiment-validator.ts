import { BaseValidator } from './base-validator';
import { NewsSentimentData, NewsItem, NewsTopic, TickerSentiment } from '../../types/alphavantage';

export class NewsSentimentValidator extends BaseValidator {
  validate(data: any): NewsSentimentData {
    // Check if data contains error messages first
    if (data['Error Message'] || data['Note'] || data['Information']) {
      throw new Error(`AlphaVantage API error: ${data['Error Message'] || data['Note'] || data['Information']}`);
    }

    // Validate and transform the data
    const validatedData: NewsSentimentData = {
      items: this.validateStringField(data.items, 'items') || '0',
      sentiment_score_definition: this.validateStringField(data.sentiment_score_definition, 'sentiment_score_definition') || '',
      relevance_score_definition: this.validateStringField(data.relevance_score_definition, 'relevance_score_definition') || '',
      feed: this.validateFeed(data.feed || [])
    };

    return validatedData;
  }

  private validateFeed(feed: any[]): NewsItem[] {
    if (!Array.isArray(feed)) {
      console.warn('News feed data is not an array, returning empty array');
      return [];
    }

    return feed.map((item, index) => {
      try {
        return {
          title: this.validateStringField(item.title, `feed[${index}].title`) || '',
          url: this.validateStringField(item.url, `feed[${index}].url`) || '',
          time_published: this.validateStringField(item.time_published, `feed[${index}].time_published`) || '',
          authors: this.validateArrayField(item.authors, `feed[${index}].authors`),
          summary: this.validateStringField(item.summary, `feed[${index}].summary`) || '',
          banner_image: this.validateStringField(item.banner_image, `feed[${index}].banner_image`),
          source: this.validateStringField(item.source, `feed[${index}].source`) || '',
          category_within_source: this.validateStringField(item.category_within_source, `feed[${index}].category_within_source`) || '',
          source_domain: this.validateStringField(item.source_domain, `feed[${index}].source_domain`) || '',
          topics: this.validateTopics(item.topics || [], index),
          overall_sentiment_score: this.validateNumericField(item.overall_sentiment_score, `feed[${index}].overall_sentiment_score`) || 0,
          overall_sentiment_label: this.validateStringField(item.overall_sentiment_label, `feed[${index}].overall_sentiment_label`) || 'Neutral',
          ticker_sentiment: this.validateTickerSentiment(item.ticker_sentiment || [], index)
        };
      } catch (error) {
        console.warn(`Error validating news item at index ${index}:`, error);
        return {
          title: '',
          url: '',
          time_published: '',
          authors: [],
          summary: '',
          source: '',
          category_within_source: '',
          source_domain: '',
          topics: [],
          overall_sentiment_score: 0,
          overall_sentiment_label: 'Neutral',
          ticker_sentiment: []
        };
      }
    }).filter(item => item.url !== ''); // Filter out invalid entries
  }

  private validateTopics(topics: any[], feedIndex: number): NewsTopic[] {
    if (!Array.isArray(topics)) {
      return [];
    }

    return topics.map((topic, index) => {
      try {
        return {
          topic: this.validateStringField(topic.topic, `feed[${feedIndex}].topics[${index}].topic`) || '',
          relevance_score: this.validateStringField(topic.relevance_score, `feed[${feedIndex}].topics[${index}].relevance_score`) || '0'
        };
      } catch (error) {
        console.warn(`Error validating topic at feed[${feedIndex}].topics[${index}]:`, error);
        return {
          topic: '',
          relevance_score: '0'
        };
      }
    }).filter(topic => topic.topic !== '');
  }

  private validateTickerSentiment(tickerSentiment: any[], feedIndex: number): TickerSentiment[] {
    if (!Array.isArray(tickerSentiment)) {
      return [];
    }

    return tickerSentiment.map((ticker, index) => {
      try {
        return {
          ticker: this.validateStringField(ticker.ticker, `feed[${feedIndex}].ticker_sentiment[${index}].ticker`) || '',
          relevance_score: this.validateStringField(ticker.relevance_score, `feed[${feedIndex}].ticker_sentiment[${index}].relevance_score`) || '0',
          ticker_sentiment_score: this.validateStringField(ticker.ticker_sentiment_score, `feed[${feedIndex}].ticker_sentiment[${index}].ticker_sentiment_score`) || '0',
          ticker_sentiment_label: this.validateStringField(ticker.ticker_sentiment_label, `feed[${feedIndex}].ticker_sentiment[${index}].ticker_sentiment_label`) || 'Neutral'
        };
      } catch (error) {
        console.warn(`Error validating ticker sentiment at feed[${feedIndex}].ticker_sentiment[${index}]:`, error);
        return {
          ticker: '',
          relevance_score: '0',
          ticker_sentiment_score: '0',
          ticker_sentiment_label: 'Neutral'
        };
      }
    }).filter(ticker => ticker.ticker !== '');
  }

  /**
   * Transform validated data for DynamoDB storage
   */
  transformForStorage(validatedData: NewsSentimentData, symbol: string) {
    return validatedData.feed.map(newsItem => ({
      news_id: newsItem.url,
      asset_symbol: symbol,
      title: newsItem.title,
      url: newsItem.url,
      time_published: newsItem.time_published,
      authors: newsItem.authors,
      summary: newsItem.summary,
      banner_image: newsItem.banner_image,
      source: newsItem.source,
      category_within_source: newsItem.category_within_source,
      source_domain: newsItem.source_domain,
      topics: newsItem.topics.map(topic => ({
        topic: topic.topic,
        relevance_score: this.validateNumericField(topic.relevance_score, 'relevance_score') || 0
      })),
      overall_sentiment_score: newsItem.overall_sentiment_score,
      overall_sentiment_label: newsItem.overall_sentiment_label,
      ticker_sentiment: newsItem.ticker_sentiment.map(ticker => ({
        ticker: ticker.ticker,
        relevance_score: this.validateNumericField(ticker.relevance_score, 'relevance_score') || 0,
        ticker_sentiment_score: this.validateNumericField(ticker.ticker_sentiment_score, 'ticker_sentiment_score') || 0,
        ticker_sentiment_label: ticker.ticker_sentiment_label
      })),
      relevance_score: newsItem.ticker_sentiment.find(ts => ts.ticker === symbol)?.relevance_score 
        ? this.validateNumericField(newsItem.ticker_sentiment.find(ts => ts.ticker === symbol)?.relevance_score, 'relevance_score')
        : null,
      last_updated: new Date().toISOString(),
      data_source: 'alphavantage'
    }));
  }
} 