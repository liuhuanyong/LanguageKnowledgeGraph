# -*- coding: utf-8 -*-
import os,sys
reload(sys)
sys.setdefaultencoding('utf-8')
from django.http import HttpResponse
from django.shortcuts import render
import json
from django.http import JsonResponse
import re
import os
import pymongo
conn=pymongo.MongoClient()
db=conn.language_law


def home(request):
    return render(request,"time_distribution.html")

def region_distribution(request):
    return render(request,"region_distribution.html")

def time_distribution(request):
    return render(request,"time_distribution.html")

def publisher_distribution(request):
    return render(request,"publisher_distribution.html")

def power_distribution(request):
    return render(request,"power_distribution.html")

def year_index(request):
    year_list=[['2017','2016','2015','2014'],
                ['2013','2012','2011','2010'],
                ['2009','2008','2007','2006'],
                ['2005','2004','2003','2002'],
                ['2001','2000','1999','1998'],
                ['1997','1996','1995','1994'],
                ['1993','1992','1991','1990'],
                ['1989','1988','1987','1986'],
                ['1985','1984','1983','1982'],
                ['1981','1980','1979','1978'],
                ['1977','1966','1965','1964'],
                ['1963','1962','1959','1958'],
                ['1957','1956','1955','1954'],
                ['1953','1952','1951']]
    data={}
    data['year_list']=year_list
    return render(request,"year_index.html",data)

def get_law_picture(law_name):#政策法规画像#定性
    db_2=conn.law2
    item=db.law_info.find({'law_name':law_name})[0]
    data={}
    sentence_list=[]
    topic_dict={}
    label_dict={}
    refer_dict={}
    keywords_dict={}
    for item in db_2.law2law_sentence.find({'law_name':law_name}):
        law_sentence=item['law_sentence']
        sentence_list.append(law_sentence)
        law_topic=item['law_topic']
        if law_topic not in topic_dict:
            topic_dict[law_topic]=1
        else:
            topic_dict[law_topic]+=1

        sentence_info=db_2.corpus_law_sentence.find({'law_sentence':law_sentence})[0]
        for label in sentence_info['label_list']:
            if label not in label_dict:
                label_dict[label]=1
            else:
                label_dict[label]+=1

        for keyword in sentence_info['sentence_keywords']:
            if keyword not in keywords_dict:
                keywords_dict[keyword]=1
            else:
                keywords_dict[keyword]+=1
    
        for refer in sentence_info['refer_law']:
            if refer not in refer_dict:
                refer_dict[refer]=1
            else:
                refer_dict[refer]+=1
        
    keywords=[]
    for item in sorted(keywords_dict.items(),key=lambda asd:asd[1],reverse=True):
        keywords.append(item[0])

    data['keywords']=keywords
    data['keywords_dict']=keywords_dict
    data['refer_dict']=refer_dict
    data['label_dict']=label_dict
    data['topic_dict']=topic_dict
    data['sentence_list']=list(set(sentence_list))
    return data


def show_picture_year(request):
    law_year=request.GET['year']
    law_list=[]
    law_region_dict={}
    law_publisher_dict={}
    sentence_dict={}
    topic_dict={}
    label_dict={}
    refer_dict={}
    keywords_dict={}
    law_power_dict={}
    for item in db.law_info.find({'law_year':law_year}):
        law_name=item['law_name']
        law_power=item['law_power']
        law_list.append(law_name)
        law_region=item['law_province']
        if law_region not in law_region_dict:
            law_region_dict[law_region]=1
        else:
            law_region_dict[law_region]+=1
         
        if law_power not in law_power_dict:
            law_power_dict[law_power]=1
        else:
            law_power_dict[law_power]+=1
       

        for law_publisher in item['law_publisher']:
            if law_publisher not in law_publisher_dict:
                law_publisher_dict[law_publisher]=1
            else:
                law_publisher_dict[law_publisher]+=1
        law_data=get_law_picture(law_name)
        for sentence in law_data['sentence_list']:
            if sentence not in sentence_dict:
                sentence_dict[sentence]=1
            else:
                sentence_dict[sentence]+=1
        
        for keyword in law_data['keywords']:
            if keyword not in keywords_dict:
                keywords_dict[keyword]=1
            else:
                keywords_dict[keyword]+=1

        for topic,topic_count in law_data['topic_dict'].items():
            if topic not in topic_dict:
                topic_dict[topic]=int(topic_count)
            else:
                topic_dict[topic]+=int(topic_count)

        for label,label_count in law_data['label_dict'].items():
            if label not in label_dict:
                label_dict[label]=int(label_count)
            else:
                label_dict[label]+=int(label_count)
        

        for refer,refer_count in law_data['refer_dict'].items():
            if refer not in refer_dict:
                refer_dict[refer]=int(refer_count)
            else:
                refer_dict[refer]+=int(refer_count)
    key_keywords=[]
    value_keywords=[]
    count_keywords=0
    for item in sorted(keywords_dict.items(),key=lambda asd:asd[1],reverse=True):
        key_keywords.append(item[0])
        value_keywords.append(int(item[1])*20)

    data={}
    key_label_list=[]
    value_label_list=[]
    for key,value in label_dict.items():
        key_label_list.append(key)
        value_label_list.append(value)

    data['key_label_list']=json.dumps(key_label_list,ensure_ascii=False)
    data['value_label_list']=json.dumps(value_label_list)

    data['year']=law_year
    data['law_list']=law_list
    data['law_publisher_dict']=json.dumps(law_publisher_dict)
    data['sentence_dict']=sentence_dict

    topic_new={}
    for key,value in topic_dict.items():
        topic_new[key]=str(value)
    data['topic_dict']=json.dumps(topic_new)
    data['label_dict']=json.dumps(label_dict)
    data['refer_dict']=json.dumps(refer_dict)
    if len(key_keywords)<201:
        data['key_keywords']=json.dumps(key_keywords[:len(key_keywords)])
        data['value_keywords']=json.dumps(value_keywords[:len(key_keywords)])
    else:
        data['key_keywords']=json.dumps(key_keywords[:200])
        data['value_keywords']=json.dumps(value_keywords[:200])

    data['power_dict']=json.dumps(law_power_dict)
    data['law_region_dict']=json.dumps(law_region_dict)

    return render(request,"show_picture_year.html",data)

def region_index(request):
    region_list=[]
    list_all=[]
    count=0
    sub_list=[]
    for item in db.law_info.find():
        list_all.append(item['law_province'])

    for item in list(set(list_all)):
        count+=1
        sub_list.append(item)
        if count%4==0:
            region_list.append(sub_list)
            sub_list=[]
    data={}
    data['region_list']=region_list
    return render(request,"region_index.html",data)



def show_picture_region(request):
    law_region=request.GET['region']
    law_list=[]
    law_year_dict={}
    law_publisher_dict={}
    sentence_dict={}
    topic_dict={}
    label_dict={}
    refer_dict={}
    keywords_dict={}
    law_power_dict={}
    for item in db.law_info.find({'law_province':law_region}):
        law_name=item['law_name']
        law_power=item['law_power']
        law_list.append(law_name)
        law_year=item['law_year']
        if law_year not in law_year_dict:
            law_year_dict[law_year]=1
        else:
            law_year_dict[law_year]+=1
         
        if law_power not in law_power_dict:
            law_power_dict[law_power]=1
        else:
            law_power_dict[law_power]+=1
       

        for law_publisher in item['law_publisher']:
            if law_publisher not in law_publisher_dict:
                law_publisher_dict[law_publisher]=1
            else:
                law_publisher_dict[law_publisher]+=1
        law_data=get_law_picture(law_name)
        for sentence in law_data['sentence_list']:
            if sentence not in sentence_dict:
                sentence_dict[sentence]=1
            else:
                sentence_dict[sentence]+=1
        
        for keyword in law_data['keywords']:
            if keyword not in keywords_dict:
                keywords_dict[keyword]=1
            else:
                keywords_dict[keyword]+=1

        for topic,topic_count in law_data['topic_dict'].items():
            if topic not in topic_dict:
                topic_dict[topic]=int(topic_count)
            else:
                topic_dict[topic]+=int(topic_count)

        for label,label_count in law_data['label_dict'].items():
            if label not in label_dict:
                label_dict[label]=int(label_count)
            else:
                label_dict[label]+=int(label_count)
        
        for refer,refer_count in law_data['refer_dict'].items():
            if refer not in refer_dict:
                refer_dict[refer]=int(refer_count)
            else:
                refer_dict[refer]+=int(refer_count)

    key_keywords=[]
    value_keywords=[]
    count_keywords=0
    for item in sorted(keywords_dict.items(),key=lambda asd:asd[1],reverse=True):
        key_keywords.append(item[0])
        value_keywords.append(int(item[1])*20)

    data={}
    key_label_list=[]
    value_label_list=[]
    for key,value in label_dict.items():
        key_label_list.append(key)
        value_label_list.append(value)

    data['key_label_list']=json.dumps(key_label_list,ensure_ascii=False)
    data['value_label_list']=json.dumps(value_label_list)

    data['region']=law_region
    data['law_list']=law_list
    data['law_publisher_dict']=json.dumps(law_publisher_dict)
    data['sentence_dict']=sentence_dict

    topic_new={}
    for key,value in topic_dict.items():
        topic_new[key]=str(value)
    data['topic_dict']=json.dumps(topic_new)
    data['label_dict']=json.dumps(label_dict)
    data['refer_dict']=json.dumps(refer_dict)
    if len(key_keywords)<201:
        data['key_keywords']=json.dumps(key_keywords[:len(key_keywords)])
        data['value_keywords']=json.dumps(value_keywords[:len(key_keywords)])
    else:
        data['key_keywords']=json.dumps(key_keywords[:200])
        data['value_keywords']=json.dumps(value_keywords[:200])

    data['power_dict']=json.dumps(law_power_dict)
    data['law_year_dict']=json.dumps(law_year_dict)

    return render(request,"show_picture_region.html",data)


def power_index(request):
    power_list=[]
    list_all=[]
    count=0
    sub_list=[]
    for item in db.law_info.find():
        list_all.append(item['law_power'])

    for item in list(set(list_all)):
        count+=1
        sub_list.append(item)
        if count%4==0:
            power_list.append(sub_list)
            sub_list=[]
    data={}
    data['power_list']=power_list
    return render(request,"power_index.html",data)

def show_picture_power(request):
    law_power=request.GET['power']
    law_list=[]
    law_year_dict={}
    law_region_dict={}
    law_publisher_dict={}
    sentence_dict={}
    topic_dict={}
    label_dict={}
    refer_dict={}
    keywords_dict={}
    law_power_dict={}
    for item in db.law_info.find({'law_power':law_power}):
        law_name=item['law_name']
        law_region=item['law_province']
        law_list.append(law_name)
        law_year=item['law_year']

        if law_year not in law_year_dict:
            law_year_dict[law_year]=1
        else:
            law_year_dict[law_year]+=1
         
        if law_region not in law_region_dict:
            law_region_dict[law_region]=1
        else:
            law_region_dict[law_region]+=1
       

        for law_publisher in item['law_publisher']:
            if law_publisher not in law_publisher_dict:
                law_publisher_dict[law_publisher]=1
            else:
                law_publisher_dict[law_publisher]+=1

        law_data=get_law_picture(law_name)
        for sentence in law_data['sentence_list']:
            if sentence not in sentence_dict:
                sentence_dict[sentence]=1
            else:
                sentence_dict[sentence]+=1
        
        for keyword in law_data['keywords']:
            if keyword not in keywords_dict:
                keywords_dict[keyword]=1
            else:
                keywords_dict[keyword]+=1

        for topic,topic_count in law_data['topic_dict'].items():
            if topic not in topic_dict:
                topic_dict[topic]=int(topic_count)
            else:
                topic_dict[topic]+=int(topic_count)

        for label,label_count in law_data['label_dict'].items():
            if label not in label_dict:
                label_dict[label]=int(label_count)
            else:
                label_dict[label]+=int(label_count)
        
        for refer,refer_count in law_data['refer_dict'].items():
            if refer not in refer_dict:
                refer_dict[refer]=int(refer_count)
            else:
                refer_dict[refer]+=int(refer_count)

    key_keywords=[]
    value_keywords=[]
    count_keywords=0
    for item in sorted(keywords_dict.items(),key=lambda asd:asd[1],reverse=True):
        key_keywords.append(item[0])
        value_keywords.append(int(item[1])*20)

    data={}
    key_label_list=[]
    value_label_list=[]
    for key,value in label_dict.items():
        key_label_list.append(key)
        value_label_list.append(value)

    data['key_label_list']=json.dumps(key_label_list,ensure_ascii=False)
    data['value_label_list']=json.dumps(value_label_list)

    data['power']=law_power
    data['law_list']=law_list
    data['law_publisher_dict']=json.dumps(law_publisher_dict)
    data['sentence_dict']=sentence_dict

    topic_new={}
    for key,value in topic_dict.items():
        topic_new[key]=str(value)
    data['topic_dict']=json.dumps(topic_new)
    data['label_dict']=json.dumps(label_dict)
    data['refer_dict']=json.dumps(refer_dict)
    if len(key_keywords)<201:
        data['key_keywords']=json.dumps(key_keywords[:len(key_keywords)])
        data['value_keywords']=json.dumps(value_keywords[:len(key_keywords)])
    else:
        data['key_keywords']=json.dumps(key_keywords[:200])
        data['value_keywords']=json.dumps(value_keywords[:200])

    data['region_dict']=json.dumps(law_region_dict)
    data['law_year_dict']=json.dumps(law_year_dict)

    return render(request,"show_picture_power.html",data)

def publisher_index(request):
    publisher_list=[]
    list_all=[]
    count=0
    sub_list=[]
    for item in db.law_info.find():
        for sub_item in item['law_publisher']:
            list_all.append(sub_item)

    for item in list(set(list_all)):
        count+=1
        sub_list.append(item)
        if count%4==0:
            publisher_list.append(sub_list)
            sub_list=[]
    data={}
    data['publisher_list']=publisher_list
    return render(request,"publisher_index.html",data)

def show_picture_publisher(request):
    law_publisher=request.GET['publisher']
    law_list=[]
    law_year_dict={}
    law_region_dict={}
    sentence_dict={}
    topic_dict={}
    label_dict={}
    refer_dict={}
    keywords_dict={}
    law_power_dict={}
    for origin_item in db.publisher_info.find({'law_publisher':law_publisher}):
        law_name=origin_item['law_name']
        for item in db.law_info.find({'law_name':law_name}):
            law_name=item['law_name']
            law_region=item['law_province']
            law_list.append(law_name)
            law_year=item['law_year']
            law_power=item['law_power']

            if law_year not in law_year_dict:
                law_year_dict[law_year]=1
            else:
                law_year_dict[law_year]+=1
             
            if law_region not in law_region_dict:
                law_region_dict[law_region]=1
            else:
                law_region_dict[law_region]+=1
           
            if law_power not in law_power_dict:
                law_power_dict[law_power]=1
            else:
                law_power_dict[law_power]+=1

            law_data=get_law_picture(law_name)
            for sentence in law_data['sentence_list']:
                if sentence not in sentence_dict:
                    sentence_dict[sentence]=1
                else:
                    sentence_dict[sentence]+=1
            
            for keyword in law_data['keywords']:
                if keyword not in keywords_dict:
                    keywords_dict[keyword]=1
                else:
                    keywords_dict[keyword]+=1

            for topic,topic_count in law_data['topic_dict'].items():
                if topic not in topic_dict:
                    topic_dict[topic]=int(topic_count)
                else:
                    topic_dict[topic]+=int(topic_count)

            for label,label_count in law_data['label_dict'].items():
                if label not in label_dict:
                    label_dict[label]=int(label_count)
                else:
                    label_dict[label]+=int(label_count)
            
            for refer,refer_count in law_data['refer_dict'].items():
                if refer not in refer_dict:
                    refer_dict[refer]=int(refer_count)
                else:
                    refer_dict[refer]+=int(refer_count)

    key_keywords=[]
    value_keywords=[]
    count_keywords=0
    for item in sorted(keywords_dict.items(),key=lambda asd:asd[1],reverse=True):
        key_keywords.append(item[0])
        value_keywords.append(int(item[1])*20)

    data={}
    key_label_list=[]
    value_label_list=[]
    for key,value in label_dict.items():
        key_label_list.append(key)
        value_label_list.append(value)

    data['key_label_list']=json.dumps(key_label_list,ensure_ascii=False)
    data['value_label_list']=json.dumps(value_label_list)

    data['power']=law_power
    data['law_list']=law_list
    data['sentence_dict']=sentence_dict
    data['publisher']=law_publisher
    topic_new={}
    for key,value in topic_dict.items():
        topic_new[key]=str(value)
    data['topic_dict']=json.dumps(topic_new)
    data['label_dict']=json.dumps(label_dict)
    data['refer_dict']=json.dumps(refer_dict)
    if len(key_keywords)<201:
        data['key_keywords']=json.dumps(key_keywords[:len(key_keywords)])
        data['value_keywords']=json.dumps(value_keywords[:len(key_keywords)])
    else:
        data['key_keywords']=json.dumps(key_keywords[:200])
        data['value_keywords']=json.dumps(value_keywords[:200])

    data['region_dict']=json.dumps(law_region_dict)
    data['law_year_dict']=json.dumps(law_year_dict)
    data['law_power_dict']=json.dumps(law_power_dict)

    return render(request,"show_picture_publisher.html",data)

def topic_index(request):
    topic_list=[['汉语拼音','繁体字','简化字','繁简字'],
                ['简体字','异体字','旧体字','异形字'],
                ['形近字','二简字','生僻字','正体字'],
                ['缺损字','字母词','方言词','外来词'],
                ['缩写词','新词语','普通话','方言'],
                ['土语','用字','用词','用语'],
                ['拼音文字','柯尔克孜文','苗文','布依文'],
                ['傣文','满文','侗文','哈萨克文'],
                ['拉祜文','哈尼文','壮文','蒙古文'],
                ['维吾尔文','瑶文','朝鲜文','白文'],
                ['锡伯文','藏文','彝文','佤文'],
                ['傣语','藏语','侗语','苗语'],
                ['佤语','布依语','柯尔克孜语','朝鲜语'],
                ['锡伯语','鄂伦春语','蒙古语','拉祜语'],
                ['壮语','彝语','白语','哈萨克语'],
                ['维吾尔语','纳西语','少数民族语','双语'],
                ['语言','文字','词语','社会用字用语'],
                ['语音']]
    data={}  
    data['topic']="语言政策主题"
    data['topic_list']=topic_list
    return render(request,"topic_index.html",data)


def show_picture_topic(request):
    law_topic=request.GET['topic']
    db_2=conn.law2
    data={}
    law_dict={}
    law_list=[]
    law_region_dict={}
    law_power_dict={}
    law_publisher_dict={}
    law_year_dict={}
    sentence_dict={}
    sentence_list=[]
    label_dict={}
    refer_dict={}
    keywords_dict={}
    for item in db_2.law2law_sentence.find({'law_topic':law_topic}):
        law_sentence=item['law_sentence']
        law_topic=item['law_topic']
        law_name=item['law_name']
        if law_name not in law_dict:
            law_dict[law_name]=1
        else:
            law_dict[law_name]+=1

        if len(law_sentence)<501:
            sentence_list.append(law_sentence)
      
        #collect law_name aspect level   
        for item in db.law_info.find({'law_name':law_name}):
            law_name=item['law_name']
            law_region=item['law_province']
            law_list.append(law_name)
            law_year=item['law_year']
            law_power=item['law_power']
            if law_year not in law_year_dict:
                law_year_dict[law_year]=1
            else:
                law_year_dict[law_year]+=1
             
            if law_region not in law_region_dict:
                law_region_dict[law_region]=1
            else:
                law_region_dict[law_region]+=1
           
            if law_power not in law_power_dict:
                law_power_dict[law_power]=1
            else:
                law_power_dict[law_power]+=1

        sentence_info=db_2.corpus_law_sentence.find({'law_sentence':law_sentence})[0]
        for label in sentence_info['label_list']:
            if label not in label_dict:
                label_dict[label]=1
            else:
                label_dict[label]+=1

        for keyword in sentence_info['sentence_keywords']:
            if keyword not in keywords_dict:
                keywords_dict[keyword]=1
            else:
                keywords_dict[keyword]+=1
    
        for refer in sentence_info['refer_law']:
            if refer not in refer_dict:
                refer_dict[refer]=1
            else:
                refer_dict[refer]+=1

    key_keywords=[]
    value_keywords=[]
    count_keywords=0
    for item in sorted(keywords_dict.items(),key=lambda asd:asd[1],reverse=True):
        key_keywords.append(item[0])
        value_keywords.append(int(item[1])*20)

    data={}
    key_label_list=[]
    value_label_list=[]
    for key,value in label_dict.items():
        key_label_list.append(key)
        value_label_list.append(value)

    data['key_label_list']=json.dumps(key_label_list,ensure_ascii=False)
    data['value_label_list']=json.dumps(value_label_list)

    if len(key_keywords)<201:
        data['key_keywords']=json.dumps(key_keywords[:len(key_keywords)])
        data['value_keywords']=json.dumps(value_keywords[:len(key_keywords)])
    else:
        data['key_keywords']=json.dumps(key_keywords[:200])
        data['value_keywords']=json.dumps(value_keywords[:200])

    data['label_dict']=json.dumps(label_dict)
    data['refer_dict']=json.dumps(refer_dict)
    data['law_region_dict']=json.dumps(law_region_dict)
    data['law_year_dict']=json.dumps(law_year_dict)
    data['law_power_dict']=json.dumps(law_power_dict)
    data['law_list']=list(set(law_list))
    data['sentence_list']=list(set(sentence_list))
    return render(request,"show_picture_topic.html",data)

def show_picture_law(request):
    law_name=request.GET['name']
    data={}
    law_info=db.law_info.find({'law_name':law_name})[0]
    data['law_power']=law_info['law_power']
    data['law_name']=law_info['law_name']
    data['law_publishtime']=law_info['law_publishtime']
    data['law_actiontime']=law_info['law_actiontime']
    data['law_region']=law_info['law_region']
    data['law_province']=law_info['law_province']
    data['law_status']=law_info['law_status']
    data['law_year']=law_info['law_year']
    data['law_publisher']='、'.join(law_info['law_publisher'])


    old_data=get_law_picture(law_name)
    keywords_dict=old_data['keywords_dict']
    refer_dict=old_data['refer_dict']
    label_dict=old_data['label_dict']
    topic_dict=old_data['topic_dict']
    sentence_list=old_data['sentence_list']
    key_keywords=[]
    value_keywords=[]
    count_keywords=0
    
    for item in sorted(keywords_dict.items(),key=lambda asd:asd[1],reverse=True):
        key_keywords.append(item[0])
        value_keywords.append(int(item[1])*20)

    if len(key_keywords)<201:
        data['key_keywords']=json.dumps(key_keywords[:len(key_keywords)])
        data['value_keywords']=json.dumps(value_keywords[:len(key_keywords)])
    else:
        data['key_keywords']=json.dumps(key_keywords[:200])
        data['value_keywords']=json.dumps(value_keywords[:200])

    data['label_dict']=json.dumps(label_dict)
    data['topic_dict']=json.dumps(topic_dict)
    data['sentence_list']=sentence_list

    return render(request,"show_picture_law.html",data)


def show_picture_label(request):
    law_label=request.GET['label']
    db_2=conn.law2
    data={}
    label_dict={}
    law_dict={}
    law_list=[]
    law_region_dict={}
    law_power_dict={}
    law_publisher_dict={}
    law_year_dict={}
    sentence_dict={}
    sentence_list=[]
    topic_dict={}
    refer_dict={}
    keywords_dict={}
    for origin_item in db_2.corpus_label.find({'label_name':law_label}):
        law_sentence=origin_item['law_sentence']
        if len(law_sentence)<501:
            sentence_list.append(law_sentence)
        sentence_list.append(law_sentence)
        for item in db_2.corpus_law_sentence.find({'law_sentence':law_sentence}):
            value=db_2.law2law_sentence.find({'law_sentence':law_sentence})[0]
            law_topic=value['law_topic']
            law_name=value['law_name']
            if law_topic not in topic_dict:
                topic_dict[law_topic]=1
            else:
                topic_dict[law_topic]+=1
            law_list.append(law_name)
            if law_sentence not in sentence_dict:
                sentence_dict[law_sentence]=1
            else:
                sentence_dict[law_sentence]+=1
                    
            for keyword in item['sentence_keywords']:
                if keyword not in keywords_dict:
                    keywords_dict[keyword]=1
                else:
                    keywords_dict[keyword]+=1
        
            for refer in item['refer_law']:
                if refer not in refer_dict:
                    refer_dict[refer]=1
                else:
                    refer_dict[refer]+=1
          
            #collect law_name aspect level   
            for item in db.law_info.find({'law_name':law_name}):
                law_name=item['law_name']
                law_region=item['law_province']
                law_list.append(law_name)
                law_year=item['law_year']
                law_power=item['law_power']
                if law_year not in law_year_dict:
                    law_year_dict[law_year]=1
                else:
                    law_year_dict[law_year]+=1
                 
                if law_region not in law_region_dict:
                    law_region_dict[law_region]=1
                else:
                    law_region_dict[law_region]+=1
               
                if law_power not in law_power_dict:
                    law_power_dict[law_power]=1
                else:
                    law_power_dict[law_power]+=1

        sentence_info=db_2.corpus_law_sentence.find({'law_sentence':law_sentence})[0]
        for keyword in sentence_info['sentence_keywords']:
            if keyword not in keywords_dict:
                keywords_dict[keyword]=1
            else:
                keywords_dict[keyword]+=1
        
        for refer in sentence_info['refer_law']:
            if refer not in refer_dict:
                refer_dict[refer]=1
            else:
                refer_dict[refer]+=1

    key_keywords=[]
    value_keywords=[]
    count_keywords=0
    for item in sorted(keywords_dict.items(),key=lambda asd:asd[1],reverse=True):
        key_keywords.append(item[0])
        value_keywords.append(int(item[1])*20)

    data={}
    key_label_list=[]
    value_label_list=[]
    for key,value in label_dict.items():
        key_label_list.append(key)
        value_label_list.append(value)

    data['key_label_list']=json.dumps(key_label_list,ensure_ascii=False)
    data['value_label_list']=json.dumps(value_label_list)

    if len(key_keywords)<201:
        data['key_keywords']=json.dumps(key_keywords[:len(key_keywords)])
        data['value_keywords']=json.dumps(value_keywords[:len(key_keywords)])
    else:
        data['key_keywords']=json.dumps(key_keywords[:200])
        data['value_keywords']=json.dumps(value_keywords[:200])

    data['topic_dict']=json.dumps(topic_dict)
    data['refer_dict']=json.dumps(refer_dict)
    data['law_region_dict']=json.dumps(law_region_dict)
    data['law_year_dict']=json.dumps(law_year_dict)
    data['law_power_dict']=json.dumps(law_power_dict)
    data['law_list']=list(set(law_list))[:10]
    data['sentence_list']=list(set(sentence_list))[:10]


    return render(request,"show_picture_label.html",data)








def label_index(request):
    label_list=[['语言规范','语言教育','语言管理','语言评估'],
                ['语言传播','语言推广','语言测试','语言信息化'],
                ['语言规划','语言研究','语言立法','语言调查'],
                ['语言资源','语言权利','语言生活','语言保护']]  
    data={}  

    data['label']="语言政策标签"
    data['label_list']=label_list
    return render(request,"label_index.html",data)
