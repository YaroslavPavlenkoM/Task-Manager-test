using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using TaskManager4.Models;
using System.Data;
using System.Web.Script.Serialization;
using System.Text.RegularExpressions;

namespace TaskManager4.Controllers
{
    [Authorize]
    public class ValuesController : ApiController
    {
        ApplicationDbContext context = new ApplicationDbContext();

        // GET api/values
        [HttpGet]
        public int Get()
        {
            List<Task> allUserTasks = new List<Task>();
            JavaScriptSerializer json = new JavaScriptSerializer();
            var userName = HttpContext.Current.User.Identity.Name;

            var tasksCount = (from ep in context.Tasks
                              join e in context.ListTasks on ep.IdTask equals e.IdTask
                              join t in context.Users on e.UserId equals t.Id
                              where t.UserName == userName
                              select new
                              {
                                  IdTask = ep.IdTask
                              }).Count();


            return tasksCount;
        }

        public string Get(int page, int count)
        {
            List<Task> allUserTasks = new List<Task>();
            JavaScriptSerializer json = new JavaScriptSerializer();
            var userName = HttpContext.Current.User.Identity.Name;

            var tasks = (from ep in context.Tasks
                         join e in context.ListTasks on ep.IdTask equals e.IdTask
                         join t in context.Users on e.UserId equals t.Id
                         where t.UserName == userName
                         select new
                         {
                             Context = ep.Context,
                             LastModification = ep.LastModification,
                             Title = ep.Title,
                             IdTask = ep.IdTask
                         }).OrderByDescending(x => x.LastModification)
                              .Skip((page - 1) * count)
                              .Take(count)
                              .ToList();


            return json.Serialize(tasks);
        }

        [HttpGet]
        public string Get(bool optionTaskSearch, bool optionDescriptionSearch, string field)
        {
            List<Task> filtredTasks = new List<Task>();
            JavaScriptSerializer json = new JavaScriptSerializer();
            var userName = HttpContext.Current.User.Identity.Name;
            bool firstFilter = false;
            bool secondFilter = false;

            var tasks = (from ep in context.Tasks
                         join e in context.ListTasks on ep.IdTask equals e.IdTask
                         join t in context.Users on e.UserId equals t.Id
                         where t.UserName == userName
                         select new
                         {
                             Context = ep.Context,
                             LastModification = ep.LastModification,
                             Title = ep.Title,
                             IdTask = ep.IdTask
                         }).ToList();

            foreach (var t in tasks)
            {
                if (optionTaskSearch)
                    firstFilter = Regex.IsMatch(t.Title, field, RegexOptions.IgnoreCase) && optionTaskSearch;
                if (optionDescriptionSearch)
                    secondFilter = Regex.IsMatch(t.Context, field, RegexOptions.IgnoreCase) && optionTaskSearch;

                if (firstFilter || secondFilter)
                {
                    Task task = new Task { IdTask = t.IdTask, Context = t.Context, LastModification = t.LastModification, Title = t.Title };
                    filtredTasks.Add(task);
                }
            }


            return json.Serialize(filtredTasks);
        }

        

        // POST api/values
        [HttpPost]
        public int Post([FromBody]Task task)
        {
            var currentUserName = HttpContext.Current.User.Identity.Name;
            Task newTask = new Task();
            ListTasks newRecord = new ListTasks();

            newTask.Context = task.Context;
            newTask.Title = task.Title;
            newTask.LastModification = DateTime.Now;
            context.Tasks.Add(newTask);

            newRecord.IdTask = newRecord.IdTask;
            newRecord.UserId = context.Users.Where(s => s.UserName == currentUserName).Select(s => s.Id).First();
            context.ListTasks.Add(newRecord);

            context.SaveChanges();

            return newTask.IdTask;
        }

        // PUT api/values/5
        public void Put(int id, [FromBody]Task task)
        {
            Task oldTask = context.Tasks.Find(id);
            oldTask.Context = task.Context;
            oldTask.Title = task.Title;
            oldTask.LastModification = DateTime.Now;

            context.Entry(oldTask).State = System.Data.Entity.EntityState.Modified;

            context.SaveChanges();
        }

        // DELETE api/values/5
        [HttpDelete]
        public void Delete(int id)
        {
            var task = new Task { IdTask = id };
            context.Tasks.Attach(task);
            context.Tasks.Remove(task);
            context.ListTasks.Remove(context.ListTasks.Where(s => s.IdTask == id).First());
            context.SaveChanges();
        }
    }
}
